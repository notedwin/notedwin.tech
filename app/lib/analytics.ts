import type { PostHog } from "posthog-js";

type Props = Record<string, string | number | boolean>;
type Client = Pick<PostHog, "capture" | "captureException" | "sessionRecordingStarted" | "startSessionRecording">;

// posthog-js is about 108 KB gzipped, so no page imports it: instrumentation-client loads it once the
// page is idle and hands it over here. Events from before that, or from readers who opted out, are dropped.
let client: Client | undefined;

export function setAnalyticsClient(posthog: Client) {
	client = posthog;
}

// `beacon` survives the page closing; use it for events sent as the reader leaves.
export function track(event: string, props?: Props, beacon = false) {
	client?.capture(event, props, beacon ? { transport: "sendBeacon" } : undefined);
}

export function trackError(error: unknown) {
	client?.captureException(error);
}

export function recordSession() {
	if (client && !client.sessionRecordingStarted()) client.startSessionRecording();
}
