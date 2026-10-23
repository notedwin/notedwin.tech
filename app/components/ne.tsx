import type { ReactNode } from "react";

// Design-system parts come from the package; PageHead is the site's own.
export { Tag, StatusMark as Status, DomainMark, Meta, SectionHead } from "@notedwin/design/react";

// Page title for inner pages: one h1, a label note on the right.
export function PageHead({ title, note, children }: { title: string; note?: ReactNode; children?: ReactNode }) {
	return (
		<div className="page-head">
			<div className="page-head__row">
				<h1>{title}</h1>
				{note && <span className="t-meta page-head__note">{note}</span>}
			</div>
			{children}
		</div>
	);
}
