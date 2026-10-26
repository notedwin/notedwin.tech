"use client";

import { useEffect } from "react";
import { track } from "app/lib/analytics";

// A reader counts as active while the tab is visible and they scrolled, moved or typed in the last 30 s.
const IDLE_MS = 30_000;

// Reports how far one reading of a post got: the furthest h2 that reached the top half of the screen,
// whether the end was seen, and active seconds. Sent when the tab hides or the reader leaves the post.
// One reading can send more than once (hidden, then back), so analysis keeps the last event per read_id.
export function ReadingTracker({ slug }: { slug: string }) {
	useEffect(() => {
		let readId = crypto.randomUUID();
		let headings = [...document.querySelectorAll<HTMLElement>(".ne-prose h2")];
		let foot = document.querySelector(".post-foot");
		let reached = 0; // 1-based index of the furthest h2; 0 before the first
		let ended = false;
		let active = 0;
		let lastInput = Date.now();
		let sent = "";

		let observer = new IntersectionObserver(
			(entries) => {
				for (let e of entries) {
					if (!e.isIntersecting) continue;
					if (e.target === foot) ended = true;
					else reached = Math.max(reached, headings.indexOf(e.target as HTMLElement) + 1);
				}
			},
			{ rootMargin: "0px 0px -50% 0px" },
		);
		headings.forEach((h) => observer.observe(h));
		if (foot) observer.observe(foot);

		let onInput = () => (lastInput = Date.now());
		let inputs = ["scroll", "pointermove", "keydown", "touchstart"];
		inputs.forEach((type) => addEventListener(type, onInput, { passive: true }));
		let tick = setInterval(() => {
			if (document.visibilityState === "visible" && Date.now() - lastInput < IDLE_MS) active++;
		}, 1000);

		function send() {
			let props = {
				slug,
				read_id: readId,
				sections: headings.length,
				section_reached: reached,
				section_id: headings[reached - 1]?.id ?? "",
				reached_end: ended,
				active_seconds: active,
			};
			let key = JSON.stringify(props);
			if (key === sent) return;
			sent = key;
			track("post_read", props, true);
		}
		let onVisibility = () => document.visibilityState === "hidden" && send();
		document.addEventListener("visibilitychange", onVisibility);

		// A read next click is the clearest sign a post held someone to the end.
		let onClick = (e: MouseEvent) => {
			let link = e.target instanceof Element ? e.target.closest(".read-next a") : null;
			if (link) track("read_next_clicked", { from: slug, to: link.getAttribute("href") ?? "" });
		};
		document.addEventListener("click", onClick);

		return () => {
			send();
			observer.disconnect();
			clearInterval(tick);
			inputs.forEach((type) => removeEventListener(type, onInput));
			document.removeEventListener("visibilitychange", onVisibility);
			document.removeEventListener("click", onClick);
		};
	}, [slug]);

	return null;
}
