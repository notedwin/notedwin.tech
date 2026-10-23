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
};

// A word in the title counts three times, in the tags twice (BM25F, folded into term frequency).
const WEIGHTS = { title: 3, tags: 2, summary: 1.5, body: 1 } as const;
const K1 = 1.2;
const B = 0.75;
// The last word also matches the terms it starts, at this weight, so results follow typing.
const PREFIX_WEIGHT = 0.5;
const PREFIX_MIN = 3;

const words = (text: string) =>
	text
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.split(/[^a-z0-9]+/)
		.filter(Boolean);

export const tokenize = (text: string) => words(text).filter((w) => !STOPWORDS.has(w)).map(stem);

export function buildIndex(docs: SearchDoc[]): SearchIndex {
	let postings: SearchIndex["postings"] = {};
	let lens = docs.map((doc, i) => {
		let tf = new Map<string, number>();
		let len = 0;
		for (let [field, weight] of Object.entries(WEIGHTS)) {
			for (let term of tokenize(doc[field as keyof typeof WEIGHTS])) {
				tf.set(term, (tf.get(term) ?? 0) + weight);
				len += weight;
			}
		}
		for (let [term, n] of tf) (postings[term] ??= []).push([i, n]);
		return len;
	});
	let avg = lens.reduce((a, b) => a + b, 0) / Math.max(lens.length, 1);
	return { slugs: docs.map((d) => d.slug), lens, avg, postings };
}

// Every matching post, best first.
export function search(index: SearchIndex, query: string): { slug: string; score: number }[] {
	let n = index.slugs.length;
	let terms = tokenize(query);
	let typed = words(query).at(-1) ?? "";
	// Only when the last term came from the last word (not when that word was a stopword).
	let expand = typed.length >= PREFIX_MIN && !STOPWORDS.has(typed);
	let scores = new Map<number, number>();

	terms.forEach((term, k) => {
		let matched: [string, number][] = index.postings[term] ? [[term, 1]] : [];
		if (expand && k === terms.length - 1) {
			for (let t in index.postings) if (t !== term && t.startsWith(typed)) matched.push([t, PREFIX_WEIGHT]);
		}
		for (let [t, weight] of matched) {
			let list = index.postings[t];
			let idf = Math.log(1 + (n - list.length + 0.5) / (list.length + 0.5));
			for (let [doc, tf] of list) {
				let norm = tf + K1 * (1 - B + (B * index.lens[doc]) / index.avg);
				scores.set(doc, (scores.get(doc) ?? 0) + (weight * idf * tf * (K1 + 1)) / norm);
			}
		}
	});

	return [...scores].sort((a, b) => b[1] - a[1]).map(([doc, score]) => ({ slug: index.slugs[doc], score }));
}
