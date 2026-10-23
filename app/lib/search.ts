import { stem } from "porter2";
import { STOPWORDS } from "./stopwords";

// BM25 over the posts, built at build time (app/search-index.json) and scored in the browser.
// Tokenizer, stemmer (Snowball English), stopwords and k1/b match DuckDB fts, which checks the
// ranking in tests/search.spec.ts.

export type SearchDoc = { slug: string; title: string; tags: string; summary: string; body: string };

export type SearchIndex = {
	slugs: string[];
	// Weighted length of each doc, and their mean.
	lens: number[];
	avg: number;
	// term -> [doc, weighted term frequency] pairs.
	postings: Record<string, [number, number][]>;
	// Word as written -> its term, where the two differ, so a prefix matches the word being typed:
	// "containe" is on the way to "container", whose term is "contain".
	forms: Record<string, string>;
	// Summary and body of each doc, one line per block, for snippets.
	text: string[];
};

// A stretch of a snippet, and whether it is a matching word.
export type Snippet = [text: string, match: boolean][];

// A word in the title counts three times, in the tags twice (BM25F, folded into term frequency).
const WEIGHTS = { title: 3, tags: 2, summary: 1.5, body: 1 } as const;
const K1 = 1.2;
const B = 0.75;
// The last word also matches the terms it starts, at this weight, so results follow typing.
// It does so from the first letter, stopword or not ("so" finds "software"), so the list narrows
// instead of emptying.
const PREFIX_WEIGHT = 0.5;
// Below three letters a prefix matches too much to explain a result, so there is no snippet.
const SNIPPET_MIN = 3;
// A snippet is one line, cut to this many characters, starting a little before its first match.
const SNIPPET_MAX = 140;
const SNIPPET_LEAD = 24;

const words = (text: string) =>
	text
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.split(/[^a-z0-9]+/)
		.filter(Boolean);

const content = (text: string) => words(text).filter((w) => !STOPWORDS.has(w));

export const tokenize = (text: string) => content(text).map(stem);

export function buildIndex(docs: SearchDoc[]): SearchIndex {
	let postings: SearchIndex["postings"] = {};
	let forms: SearchIndex["forms"] = {};
	let lens = docs.map((doc, i) => {
		let tf = new Map<string, number>();
		let len = 0;
		for (let [field, weight] of Object.entries(WEIGHTS)) {
			for (let word of content(doc[field as keyof typeof WEIGHTS])) {
				let term = stem(word);
				if (term !== word) forms[word] = term;
				tf.set(term, (tf.get(term) ?? 0) + weight);
				len += weight;
			}
		}
		for (let [term, n] of tf) (postings[term] ??= []).push([i, n]);
		return len;
	});
	let avg = lens.reduce((a, b) => a + b, 0) / Math.max(lens.length, 1);
	let text = docs.map((d) => `${d.summary}\n${d.body}`);
	return { slugs: docs.map((d) => d.slug), lens, avg, postings, forms, text };
}

// The query's terms with their weights: each word's term, plus the terms the last word starts.
function queryTerms(index: SearchIndex, query: string): [string, number][] {
	let terms = tokenize(query);
	let typed = words(query).at(-1) ?? "";
	// A stopword never became a term, so the last term came from an earlier word.
	let last = STOPWORDS.has(typed) ? undefined : terms.at(-1);
	let matched: [string, number][] = terms.filter((t) => index.postings[t]).map((t) => [t, 1]);
	if (typed) {
		let started = new Set<string>();
		for (let t in index.postings) if (t.startsWith(typed)) started.add(t);
		for (let w in index.forms) if (w.startsWith(typed)) started.add(index.forms[w]);
		if (last) started.delete(last);
		for (let t of started) matched.push([t, PREFIX_WEIGHT]);
	}
	return matched;
}

// Every matching post, best first.
export function search(index: SearchIndex, query: string): { slug: string; doc: number; score: number }[] {
	let n = index.slugs.length;
	let scores = new Map<number, number>();
	for (let [t, weight] of queryTerms(index, query)) {
		let list = index.postings[t];
		let idf = Math.log(1 + (n - list.length + 0.5) / (list.length + 0.5));
		for (let [doc, tf] of list) {
			let norm = tf + K1 * (1 - B + (B * index.lens[doc]) / index.avg);
			scores.set(doc, (scores.get(doc) ?? 0) + (weight * idf * tf * (K1 + 1)) / norm);
		}
	}
	return [...scores].sort((a, b) => b[1] - a[1]).map(([doc, score]) => ({ slug: index.slugs[doc], doc, score }));
}

// The line of a post that best shows why it matched, matching words marked: the most query terms,
// whole words before prefixes, the earliest line on a tie (the summary comes first). Null when the
// match is only in the title or tags, which the card already shows.
export function snippet(index: SearchIndex, doc: number, query: string): Snippet | null {
	if (words(query).join("").length < SNIPPET_MIN) return null;
	let wanted = new Map<string, number>();
	for (let [t, weight] of queryTerms(index, query)) wanted.set(t, Math.max(weight, wanted.get(t) ?? 0));

	let best: { line: string; hits: [number, number][]; score: number } | null = null;
	for (let line of index.text[doc].split(/\n|(?<=[.!?])\s+/)) {
		let hits: [number, number][] = [];
		let found = new Map<string, number>();
		for (let m of line.matchAll(/[\p{L}\p{N}]+/gu)) {
			let terms = content(m[0]).map(stem).filter((t) => wanted.has(t));
			if (!terms.length) continue;
			hits.push([m.index, m.index + m[0].length]);
			for (let t of terms) found.set(t, wanted.get(t)!);
		}
		let score = [...found.values()].reduce((a, b) => a + b, 0);
		if (score > (best?.score ?? 0)) best = { line, hits, score };
	}
	if (!best) return null;

	// Cut long lines on word boundaries around the first match.
	let { line, hits } = best;
	let start = 0;
	let end = line.length;
	if (line.length > SNIPPET_MAX) {
		start = Math.max(0, hits[0][0] - SNIPPET_LEAD);
		if (start > 0) start = line.indexOf(" ", start) + 1 || start;
		if (start > hits[0][0]) start = hits[0][0];
		end = Math.min(line.length, start + SNIPPET_MAX);
		if (end < line.length) end = line.lastIndexOf(" ", end) > hits[0][1] ? line.lastIndexOf(" ", end) : end;
	}
	let parts: Snippet = [];
	let at = start;
	for (let [from, to] of hits) {
		if (from < at || to > end) continue;
		if (from > at) parts.push([line.slice(at, from), false]);
		parts.push([line.slice(from, to), true]);
		at = to;
	}
	if (end > at) parts.push([line.slice(at, end), false]);
	if (start > 0) parts.unshift(["…", false]);
	if (end < line.length) parts.push(["…", false]);
	return parts;
}
