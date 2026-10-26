"use client";

import { track } from "app/lib/analytics";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import type { SearchIndex, Snippet, search as searchFn, snippet as snippetFn } from "app/lib/search";

type Entry = { slug: string; card: ReactNode };
type Sort = "newest" | "oldest";
type Engine = { index: SearchIndex; search: typeof searchFn; snippet: typeof snippetFn };

// A search box and newest/oldest sort over the server-rendered post cards (passed newest first).
// The index and the scoring code load the first time someone reaches for the box, so a plain
// visit to /blog downloads neither. Query and sort live in the URL (?q=, ?sort=oldest).
// While searching, each card shows the line that matched. `/` focuses the box; Enter moves to the
// first result, which also closes a phone's keyboard.
export function BlogSearch({ entries }: { entries: Entry[] }) {
	let id = useId();
	let [query, setQuery] = useState("");
	let [sort, setSort] = useState<Sort>("newest");
	let [engine, setEngine] = useState<Engine | "loading" | "error" | null>(null);
	let pending = useRef<Promise<void> | null>(null);
	let input = useRef<HTMLInputElement>(null);
	let list = useRef<HTMLUListElement>(null);

	function load() {
		if (pending.current) return;
		setEngine("loading");
		pending.current = Promise.all([
			import("app/lib/search"),
			fetch("/search-index.json").then((r) => {
				if (!r.ok) throw new Error(`search index: ${r.status}`);
				return r.json() as Promise<SearchIndex>;
			}),
		])
			.then(([lib, index]) => setEngine({ index, search: lib.search, snippet: lib.snippet }))
			.catch(() => {
				// Try again on the next focus.
				pending.current = null;
				setEngine("error");
			});
	}

	function update(nextQuery: string, nextSort: Sort) {
		setQuery(nextQuery);
		setSort(nextSort);
		let params = new URLSearchParams(window.location.search);
		nextQuery ? params.set("q", nextQuery) : params.delete("q");
		nextSort === "oldest" ? params.set("sort", "oldest") : params.delete("sort");
		let qs = params.toString();
		window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
	}

	// A shared link (?q=…) searches on arrival.
	useEffect(() => {
		let params = new URLSearchParams(window.location.search);
		let q = params.get("q") ?? "";
		setQuery(q);
		setSort(params.get("sort") === "oldest" ? "oldest" : "newest");
		if (q) load();
	}, []);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
			let el = e.target as HTMLElement;
			if (el.closest("input, textarea, select, [contenteditable]")) return;
			e.preventDefault();
			input.current?.focus();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	let q = query.trim();
	let ready = typeof engine === "object" ? engine : null;
	let searching = q !== "" && ready !== null;
	let shown: (Entry & { snippet?: Snippet | null })[] = entries;
	if (q && ready) {
		let bySlug = new Map(entries.map((e) => [e.slug, e]));
		shown = ready.search(ready.index, q).flatMap((r) => {
			let entry = bySlug.get(r.slug);
			return entry ? [{ ...entry, snippet: ready.snippet(ready.index, r.doc, q) }] : [];
		});
	} else if (sort === "oldest") {
		shown = [...entries].reverse();
	}

	let status = `${entries.length} posts, ${sort} first`;
	if (q && engine === "loading") status = "loading search";
	else if (q && engine === "error") status = "couldn't load search. showing every post; focus the box to retry";
	else if (searching && shown.length === 0) status = `no posts match “${q}”`;
	else if (searching) status = `${shown.length} ${shown.length === 1 ? "post matches" : "posts match"} “${q}”, best match first`;

	return (
		<>
			<div className="blog-search" role="search">
				<label className="ne-sr-only" htmlFor={id}>
					search posts
				</label>
				<input
					ref={input}
					id={id}
					className="blog-search__input"
					type="search"
					placeholder="search posts"
					autoComplete="off"
					spellCheck={false}
					enterKeyHint="search"
					aria-keyshortcuts="/"
					value={query}
					onFocus={load}
					onPointerEnter={load}
					onChange={(e) => {
						load();
						update(e.target.value, sort);
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape" && query) {
							e.preventDefault();
							update("", sort);
						}
						if (e.key === "Enter" && searching) {
							e.preventDefault();
							track("blog_search_submitted", { result_count: shown.length });
							list.current?.querySelector("a")?.focus();
						}
					}}
				/>
				<div className="ne-seg blog-search__sort" role="group" aria-label="sort">
					{(["newest", "oldest"] as const).map((s) => (
						<button key={s} type="button" aria-pressed={!searching && sort === s} disabled={searching} onClick={() => update(query, s)}>
							{s}
						</button>
					))}
				</div>
			</div>
			<p className="t-meta blog-search__status" role="status">
				{status}
			</p>
			{searching && shown.length === 0 ? (
				// Empty state: the status says what happened; one action to undo it.
				<button type="button" className="ne-btn ne-btn--secondary" onClick={() => update("", sort)}>
					clear search
				</button>
			) : (
				<ul className="post-grid" ref={list}>
					{shown.map((e) => (
						<li key={e.slug}>
							{e.card}
							{e.snippet && (
								<p className="t-body-sm post-card__snippet">
									{e.snippet.map(([text, match], i) => (match ? <mark key={i}>{text}</mark> : text))}
								</p>
							)}
						</li>
					))}
				</ul>
			)}
		</>
	);
}
