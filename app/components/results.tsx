import type { CSSProperties } from "react";

type Row = {
	label?: string;
	params?: string;
	// Features this row's model was trained on, when comparing feature sets.
	uses?: string[];
	values: Record<string, number>;
};

type Props = {
	n: number;
	caption: string;
	// The metrics drawn as bars; every value still appears in the table view.
	metrics: string[];
	rows: Row[];
	features?: string[];
	// The row the post is about, drawn in the domain fill.
	highlight?: number;
};

const fmt = (v: number) => v.toFixed(3);

// Model results as small multiples: one bar panel per metric on a shared 0–1 scale, the chosen
// row in the domain fill and the rest in ink-faint. With `features`, a dot matrix shows which
// features each row used. The full numbers sit in a table view underneath.
export function Results({ n, caption, metrics, rows, features = [], highlight = 0 }: Props) {
	let columns = Object.keys(rows[0].values);
	let hasLabel = rows.some((r) => r.label);
	let template = [
		hasLabel && "max-content",
		features.length && `repeat(${features.length}, 12px)`,
		`repeat(${metrics.length}, minmax(0, 1fr))`,
	]
		.filter(Boolean)
		.join(" ");
	let summary = rows
		.map((r, i) => {
			let name = r.label ?? (r.uses ? r.uses.join(", ") : `row ${i + 1}`);
			return `${name}: ${metrics.map((m) => `${m} ${fmt(r.values[m])}`).join(", ")}`;
		})
		.join("; ");

	return (
		<figure className="ne-fig results">
			<div
				className="results__plot"
				role="img"
				aria-label={`${caption}. ${summary}`}
				style={{ gridTemplateColumns: template }}
			>
				<div className="results__row results__row--head" aria-hidden="true">
					{hasLabel && <span />}
					{features.map((f) => (
						<span key={f} className="results__feature">
							{f}
						</span>
					))}
					{metrics.map((m, j) => (
						<span key={m} className={`results__metric${j === 0 ? " results__first" : ""}`}>
							{m}
						</span>
					))}
				</div>
				{rows.map((r, i) => (
					<div key={i} className={`results__row${i === highlight ? " is-hi" : ""}`} aria-hidden="true">
						{hasLabel && <span className="results__label">{r.label}</span>}
						{features.map((f) => (
							<span key={f} className={`results__dot${r.uses?.includes(f) ? " is-on" : ""}`} />
						))}
						{metrics.map((m, j) => (
							<span key={m} className={`results__bar${j === 0 ? " results__first" : ""}`}>
								<span className="results__track">
									<span style={{ "--v": r.values[m] } as CSSProperties} />
								</span>
								<span className="results__value">{fmt(r.values[m])}</span>
							</span>
						))}
					</div>
				))}
			</div>
			<figcaption>
				<span>
					<b>fig:{String(n).padStart(2, "0")}</b> · {caption}
				</span>
				<span>ember = {rows[highlight].label ?? "chosen features"} · scale 0–1</span>
			</figcaption>
			<details className="results__table">
				<summary className="t-meta">table</summary>
				<div className="table-wrap table-wrap--wide" tabIndex={0} role="region" aria-label={`table: ${caption}`}>
					<table>
						<thead>
							<tr>
								{hasLabel && <th>model</th>}
								{rows.some((r) => r.params) && <th>parameters</th>}
								{features.length > 0 && <th>features</th>}
								{columns.map((c) => (
									<th key={c} className="num">
										{c}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((r, i) => (
								<tr key={i}>
									{hasLabel && <td>{r.label}</td>}
									{rows.some((r) => r.params) && <td>{r.params}</td>}
									{features.length > 0 && <td className="wrap">{r.uses?.join(", ")}</td>}
									{columns.map((c) => (
										<td key={c} className="num">
											{fmt(r.values[c])}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</details>
		</figure>
	);
}
