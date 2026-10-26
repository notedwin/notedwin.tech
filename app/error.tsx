"use client";

import { useEffect } from "react";
import { trackError } from "./lib/analytics";
import { PageHead } from "./components/ne";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		trackError(error);
		console.error(error);
	}, [error]);

	return (
		<main id="main">
			<PageHead title="Something broke" note="status:error">
				<p className="ne-pagehead__lede">This page failed to render. Try again; if it keeps failing, the blog still works.</p>
			</PageHead>
			<p className="stack-links">
				<button className="ne-btn ne-btn--secondary" type="button" onClick={reset}>
					try again
				</button>
				<a className="more-link" href="/blog">
					› read the blog
				</a>
			</p>
		</main>
	);
}
