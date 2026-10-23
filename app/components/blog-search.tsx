"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import type { SearchIndex, search as searchFn } from "app/lib/search";

type Entry = { slug: string; card: ReactNode };
type Sort = "newest" | "oldest";
type Engine = { index: SearchIndex; search: typeof searchFn };

// A search box and newest/oldest sort over the server-rendered post cards (passed newest first).
// The index and the scoring code load the first time someone reaches for the box, so a plain
// visit to /blog downloads neither. Query and sort live in the URL (?q=, ?sort=oldest).
export function BlogSearch({ entries }: { entries: Entry[] }) {
	let id = useId();
	let [query, setQuery] = useState("");
	let [sort, setSort] = useState<Sort>("newest");
	let [engine, setEngine] = useState<Engine | "loading" | "error" | null>(null);
	let pending = useRef<Promise<void> | null>(null);

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
			.then(([lib, index]) => setEngine({ index, search: lib.search }))
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

	let q = query.trim();
	let ready = typeof engine === "object" ? engine : null;
	let searching = q !== "" && ready !== null;
	let shown = entries;
	if (q && ready) {
		let bySlug = new Map(entries.map((e) => [e.slug, e]));
		shown = ready.search(ready.index, q).flatMap((r) => bySlug.get(r.slug) ?? []);
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
					id={id}
					className="blog-search__input"
					type="search"
					placeholder="search posts"
					autoComplete="off"
					spellCheck={false}
					enterKeyHint="search"
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
				<ul className="post-grid">
					{shown.map((e) => (
						<li key={e.slug}>{e.card}</li>
					))}
				</ul>
			)}
		</>
	);
}
