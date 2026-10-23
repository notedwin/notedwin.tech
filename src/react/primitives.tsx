import type { ReactNode } from "react";

// Small design-system parts with no client code; safe in server components.

export type Domain = "infra" | "data" | "play";
export type Status = "seed" | "growing" | "settled" | "live";

// A domain tag: swatch, lowercase text in the domain ink, on the domain wash. At most 3 per item.
export function Tag({ domain, children }: { domain: Domain; children: ReactNode }) {
	return (
		<span className="ne-tag" data-domain={domain}>
			{children}
		</span>
	);
}

// Maturity (seed, growing, settled) in ink, or "live" as system state. The word is required.
export function StatusMark({ state }: { state: Status }) {
	return (
		<span className="ne-status" data-state={state}>
			{state}
		</span>
	);
}

// The domain word with its square swatch, for meta lines.
export function DomainMark({ domain }: { domain: Domain }) {
	return (
		<span className="ne-dom" data-domain={domain}>
			{domain}
		</span>
	);
}

// key:value metadata; the colon comes from CSS.
export function Meta({ k, children }: { k: string; children: ReactNode }) {
	return (
		<span className="ne-meta">
			<span className="ne-meta__key">{k}</span>
			<span className="ne-meta__value">{children}</span>
		</span>
	);
}

// Section head: a `section` title on the left, a label note on the right, a rule under both.
export function SectionHead({ id, title, note }: { id?: string; title: string; note?: ReactNode }) {
	return (
		<div className="ne-sh">
			<h2 id={id}>{title}</h2>
			{note && <span>{note}</span>}
		</div>
	);
}

// Page head for inner pages: one h1, an optional meta note on the right, then any lede as children.
export function PageHead({ title, note, children }: { title: string; note?: ReactNode; children?: ReactNode }) {
	return (
		<div className="ne-pagehead">
			<div className="ne-pagehead__row">
				<h1>{title}</h1>
				{note && <span className="t-meta ne-pagehead__note">{note}</span>}
			</div>
			{children}
		</div>
	);
}
