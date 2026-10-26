import { recordSession, setAnalyticsClient } from "app/lib/analytics";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Replay runs on posts only: that is where reading drops off, and other pages skip the 67 KB recorder.
const isPost = (path: string) => /^\/blog\/[^/]+/.test(path);

// ?notrack stops analytics in this browser (Edwin's own reading), ?track turns it back on, and is the
// only way to send events from localhost, so local runs never count as readers.
function enabled() {
	try {
		let params = new URLSearchParams(location.search);
		if (params.has("notrack")) localStorage.setItem("analytics", "off");
		if (params.has("track")) localStorage.setItem("analytics", "on");
		let stored = localStorage.getItem("analytics");
		if (stored) return stored === "on";
	} catch {}
	return !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
}

function start() {
	import("posthog-js").then(({ default: posthog }) => {
		posthog.init(key!, {
			// Proxied through this domain (next.config.ts), so blockers that list posthog.com don't hide readers.
			api_host: "/ingest",
			ui_host: "https://us.posthog.com",
			defaults: "2026-01-30",
			// Nothing goes in cookies or storage, so no consent banner. The cost: a full page load starts a new
			// visitor, so Vercel Analytics stays the visitor count. cookieless_mode would keep visitors but
			// turns off replay.
			persistence: "memory",
			disable_session_recording: true,
			autocapture: { capture_copied_text: true },
			capture_heatmaps: true,
			capture_exceptions: true,
			// The site never shows pop-ups, so surveys stay off whatever the project settings say.
			disable_surveys: true,
			loaded: (ph) => {
				setAnalyticsClient(ph);
				if (isPost(location.pathname)) ph.startSessionRecording();
			},
		});
	});
}

if (key && enabled()) {
	if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 4000 });
	else setTimeout(start, 2000);
}

export function onRouterTransitionStart(url: string) {
	if (isPost(new URL(url, location.href).pathname)) recordSession();
}
