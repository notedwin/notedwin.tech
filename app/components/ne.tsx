import type { ReactNode } from "react";
import type { Domain, Status as StatusWord } from "app/lib/posts";

// Small design-system pieces (Tag, Status, Meta, section head) as server components.

export function Tag({ domain, children }: { domain: Domain; children: ReactNode }) {
	return (
		<span className="ne-tag" data-domain={domain}>
			{children}
		</span>
	);
}

export function Status({ state }: { state: StatusWord }) {
	// "live" is a system state (signal-live); the rest are maturity, drawn in ink.
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

export function Meta({ k, children }: { k: string; children: ReactNode }) {
	return (
		<span className="ne-meta">
			<span className="ne-meta__key">{k}</span>
			<span className="ne-meta__value">{children}</span>
		</span>
	);
}

export function SectionHead({ id, title, note }: { id?: string; title: string; note?: ReactNode }) {
	return (
		<div className="ne-sh">
			<h2 id={id}>{title}</h2>
			{note && <span>{note}</span>}
		</div>
	);
}

// Page title for inner pages: one h1, a label note on the right.
export function PageHead({ title, note, children }: { title: string; note?: ReactNode; children?: ReactNode }) {
	return (
		<div className="page-head">
			<div className="page-head__row">
				<h1>{title}</h1>
				{note && <span className="t-label page-head__note">{note}</span>}
			</div>
			{children}
		</div>
	);
}
