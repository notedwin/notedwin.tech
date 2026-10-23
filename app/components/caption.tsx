import type { ReactNode } from "react";

// A photo's caption: a sentence, so meta type (Commit Mono) and its own capitals.
export function CaptionComponent({ children }: { children: ReactNode }) {
	return <span className="caption t-meta">{children}</span>;
}
