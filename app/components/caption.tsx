import type { ReactNode } from "react";

// Figure caption in the label face.
export function CaptionComponent({ children }: { children: ReactNode }) {
	return <span className="caption t-label">{children}</span>;
}
