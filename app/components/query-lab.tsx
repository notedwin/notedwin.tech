"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

type Preset = { label: string; sql: string };

type Props = {
	n: number;
	caption: string;
	// Served from public/; the view `table` reads it over HTTP range requests.
	src: string;
	table: string;
	presets: Preset[];
};

type Kind = "text" | "number" | "time";
type Column = { name: string; kind: Kind; unit: number };
type Result = { columns: Column[]; rows: unknown[][]; total: number; ms: number };
type Status = "idle" | "loading" | "running" | "done" | "error";

// The table shows this many rows; the status line says when a result has more.
const MAX_ROWS = 200;
const MAX_BARS = 15;

// One database per page, started on the first run: nothing downloads until the reader asks.
let connection: Promise<AsyncDuckDBConnection> | null = null;

function connect(src: string, table: string) {
	connection ??= (async () => {
		let duckdb = await import("@duckdb/duckdb-wasm");
		let bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
		// A worker can't load a cross-origin script directly, so a same-origin blob imports it.
		let url = URL.createObjectURL(new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" }));
		let db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), new Worker(url));
		await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
		URL.revokeObjectURL(url);
		let file = src.split("/").pop()!;
		await db.registerFileURL(file, new URL(src, location.href).href, duckdb.DuckDBDataProtocol.HTTP, false);
		let conn = await db.connect();
		await conn.query(`CREATE VIEW ${table} AS SELECT * FROM read_parquet('${file}')`);
		return conn;
	})();
	connection.catch(() => (connection = null));
	return connection;
}

// Arrow type names → how to read and draw the column. Timestamps arrive in their unit as bigint
// or already in ms as numbers, depending on the type, so `unit` converts bigints to ms.
function columnOf(name: string, type: string): Column {
	if (/^(Timestamp|Date)/.test(type)) {
		let unit = /NANO/.test(type) ? 1e6 : /MICRO/.test(type) ? 1e3 : /SECOND>/.test(type) && !/MILLI/.test(type) ? 1e-3 : 1;
		return { name, kind: "time", unit };
	}
	if (/^(Int|Uint|Float|Decimal)/.test(type)) return { name, kind: "number", unit: 1 };
	return { name, kind: "text", unit: 1 };
}

function valueOf(v: unknown, col: Column): unknown {
	if (v == null) return null;
	if (col.kind === "time") {
		if (v instanceof Date) return v.getTime();
		return typeof v === "bigint" ? Number(v) / col.unit : Number(v);
	}
	if (col.kind === "number") return Number(v);
	return String(v);
}

const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function format(v: unknown, col: Column, dateOnly: boolean) {
	if (v == null) return "null";
	if (col.kind === "number") return num.format(v as number);
	if (col.kind === "time") {
		let iso = new Date(v as number).toISOString();
		return dateOnly ? iso.slice(0, 10) : iso.slice(0, 16).replace("T", " ");
	}
	return v as string;
}

type Chart =
	| { type: "stat" }
	| { type: "bars"; label: number; value: number }
	| { type: "columns"; x: number; value: number; step: number; slots: number }
	| { type: "none" };

// The result's shape picks the figure: one number is a readout, a label and a count are bars, an
// ordered axis (time or number) and a count are columns. Anything else is a table.
function chartOf({ columns, rows }: Result): Chart {
	if (rows.length === 0) return { type: "none" };
	if (rows.length === 1 && columns.length === 1 && columns[0].kind === "number") return { type: "stat" };
	let value = columns.findIndex((c, i) => i > 0 && c.kind === "number");
	if (value < 0 || rows.length < 2) return { type: "none" };
	let first = columns[0];
	let xs = rows.map((r) => r[0] as number);
	let ordered = first.kind !== "text" && xs.every((x, i) => x != null && (i === 0 || x > xs[i - 1]));
	if (ordered) {
		let step = Math.min(...xs.slice(1).map((x, i) => x - xs[i]));
		let slots = Math.round((xs[xs.length - 1] - xs[0]) / step) + 1;
		if (slots <= 2000) return { type: "columns", x: 0, value, step, slots };
	}
	return { type: "bars", label: 0, value };
}

export function QueryLab({ n, caption, src, table, presets }: Props) {
	let [sql, setSql] = useState(presets[0].sql);
	let [status, setStatus] = useState<Status>("idle");
	let [result, setResult] = useState<Result | null>(null);
	let [error, setError] = useState("");
	let run = useRef(0);

	async function execute(text = sql) {
		let id = ++run.current;
		setStatus(connection ? "running" : "loading");
		try {
			let conn = await connect(src, table);
			if (id === run.current) setStatus("running");
			let start = performance.now();
			let res = await conn.query(text);
			let ms = performance.now() - start;
			if (id !== run.current) return;
			let columns = res.schema.fields.map((f) => columnOf(f.name, String(f.type)));
			let rows: unknown[][] = [];
			for (let i = 0; i < Math.min(res.numRows, 2000); i++) {
				let row = res.get(i)!;
				rows.push(columns.map((c) => valueOf(row[c.name], c)));
			}
			setResult({ columns, rows, total: res.numRows, ms });
			setStatus("done");
		} catch (e) {
			if (id !== run.current) return;
			setError(e instanceof Error ? e.message : String(e));
			setStatus("error");
		}
	}

	let busy = status === "loading" || status === "running";
	let note = {
		idle: "runs duckdb in your browser · the first run downloads about 9 MB",
		loading: "loading duckdb and the data…",
		running: "running…",
		done: result && `${num.format(result.total)} ${result.total === 1 ? "row" : "rows"} · ${Math.round(result.ms)} ms`,
		error: "the query failed",
	}[status];

	return (
		<figure className="ne-fig qlab">
			<div className="ne-tabs qlab__presets" role="group" aria-label="example queries">
				{presets.map((p) => (
					<button
						key={p.label}
						type="button"
						aria-pressed={p.sql === sql}
						disabled={busy}
						onClick={() => {
							setSql(p.sql);
							execute(p.sql);
						}}
					>
						{p.label}
					</button>
				))}
			</div>
			<label className="ne-sr-only" htmlFor={`qlab-${n}`}>
				sql against the {table} table
			</label>
			<textarea
				id={`qlab-${n}`}
				className="qlab__sql"
				value={sql}
				rows={Math.min(10, sql.split("\n").length + 1)}
				spellCheck={false}
				autoCapitalize="off"
				autoCorrect="off"
				onChange={(e) => setSql(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !busy) {
						e.preventDefault();
						execute();
					}
				}}
			/>
			<div className="qlab__bar">
				<button type="button" className="ne-btn ne-btn--secondary" disabled={busy} onClick={() => execute()}>
					run
				</button>
				<span className="t-meta qlab__note" role="status">
					{note}
				</span>
			</div>
			{status === "error" && (
				<p className="qlab__error">
					<span aria-hidden="true" className="qlab__square" />
					<span>error · {error}</span>
				</p>
			)}
			{result && status !== "error" && <Output result={result} />}
			<figcaption>
				<span>
					<b>fig:{String(n).padStart(2, "0")}</b> · {caption}
				</span>
				<span>table: {table} · cmd+enter runs</span>
			</figcaption>
		</figure>
	);
}

function Output({ result }: { result: Result }) {
	let { columns, rows, total } = result;
	let chart = chartOf(result);
	let dateOnly = columns.map((c, i) => c.kind === "time" && rows.every((r) => r[i] == null || (r[i] as number) % 864e5 === 0));
	let cell = (r: unknown[], i: number) => format(r[i], columns[i], dateOnly[i]);

	if (rows.length === 0) return <p className="t-meta qlab__empty">no rows. the query ran and matched nothing.</p>;

	return (
		<div className="qlab__out">
			{chart.type === "stat" && (
				<p className="qlab__stat">
					<span className="t-meta qlab__stat-label">{columns[0].name}</span>
					<span className="t-metric">{cell(rows[0], 0)}</span>
				</p>
			)}
			{chart.type === "bars" && <Bars rows={rows} chart={chart} columns={columns} cell={cell} />}
			{chart.type === "columns" && <Columns key={result.ms} rows={rows} chart={chart} columns={columns} cell={cell} />}
			{chart.type !== "stat" && (
				<details className="qlab__table" open={chart.type === "none"}>
					<summary className="t-meta">table{total > MAX_ROWS ? ` · first ${MAX_ROWS} of ${num.format(total)}` : ""}</summary>
					<div className="table-wrap table-wrap--wide" tabIndex={0} role="region" aria-label="query result">
						<table>
							<thead>
								<tr>
									{columns.map((c) => (
										<th key={c.name} className={c.kind === "number" ? "num" : undefined}>
											{c.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{rows.slice(0, MAX_ROWS).map((r, j) => (
									<tr key={j}>
										{columns.map((c, i) => (
											<td key={c.name} className={c.kind === "number" ? "num" : undefined}>
												{cell(r, i)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</details>
			)}
		</div>
	);
}

type Cell = (r: unknown[], i: number) => string;

// The largest value takes the domain fill; the rest stay ink-faint.
function largest(rows: unknown[][], i: number) {
	return rows.reduce((best, r, j) => ((r[i] as number) > (rows[best][i] as number) ? j : best), 0);
}

function Bars({ rows, columns, chart, cell }: { rows: unknown[][]; columns: Column[]; chart: Extract<Chart, { type: "bars" }>; cell: Cell }) {
	let shown = rows.slice(0, MAX_BARS);
	let max = Math.max(...shown.map((r) => (r[chart.value] as number) ?? 0), 0);
	let hi = largest(shown, chart.value);
	let summary = shown.map((r) => `${cell(r, chart.label)} ${cell(r, chart.value)}`).join(", ");
	return (
		<div className="qlab__bars" role="img" aria-label={`${columns[chart.value].name} by ${columns[chart.label].name}: ${summary}`}>
			{shown.map((r, j) => (
				<div key={j} className={`qlab__row${j === hi ? " is-hi" : ""}`} aria-hidden="true">
					<span className="qlab__label">{cell(r, chart.label)}</span>
					<span className="qlab__track">
						<span style={{ "--v": max > 0 ? Math.max(0, (r[chart.value] as number) ?? 0) / max : 0 } as CSSProperties} />
					</span>
					<span className="qlab__value">{cell(r, chart.value)}</span>
				</div>
			))}
			{rows.length > MAX_BARS && <span className="t-meta qlab__more">top {MAX_BARS} drawn · all rows in the table</span>}
		</div>
	);
}

function Columns({ rows, columns, chart, cell }: { rows: unknown[][]; columns: Column[]; chart: Extract<Chart, { type: "columns" }>; cell: Cell }) {
	let hi = largest(rows, chart.value);
	// No hover: the readout names the largest value. Hover: the column under the pointer.
	let [active, setActive] = useState<number | null>(null);
	let shown = active ?? hi;
	let x0 = rows[0][chart.x] as number;
	let max = Math.max(...rows.map((r) => (r[chart.value] as number) ?? 0), 0);
	let slotOf = (r: unknown[]) => Math.round(((r[chart.x] as number) - x0) / chart.step);
	let dense = chart.slots > 120;
	let xName = columns[chart.x].name;
	let yName = columns[chart.value].name;

	function point(e: PointerEvent<HTMLDivElement>) {
		let box = e.currentTarget.getBoundingClientRect();
		let slot = ((e.clientX - box.left) / box.width) * chart.slots;
		let near = rows.reduce((best, r, j) => (Math.abs(slotOf(r) + 0.5 - slot) < Math.abs(slotOf(rows[best]) + 0.5 - slot) ? j : best), 0);
		setActive(near);
	}

	return (
		<div className="qlab__colfig">
			<p className="t-meta qlab__readout" aria-hidden="true">
				{xName} <b>{cell(rows[shown], chart.x)}</b> · {yName} <b>{cell(rows[shown], chart.value)}</b>
			</p>
			<div
				className={`qlab__cols${dense ? " is-dense" : ""}`}
				role="img"
				aria-label={`${yName} by ${xName}, ${rows.length} points from ${cell(rows[0], chart.x)} to ${cell(rows[rows.length - 1], chart.x)}; largest ${cell(rows[hi], chart.value)} at ${cell(rows[hi], chart.x)}`}
				onPointerMove={point}
				onPointerLeave={() => setActive(null)}
			>
				<span className="qlab__fig-max" aria-hidden="true">
					{num.format(max)}
				</span>
				{rows.map((r, j) => (
					<span
						key={j}
						className={`qlab__col${j === hi ? " is-hi" : ""}${j === active ? " is-on" : ""}`}
						style={
							{
								"--x": slotOf(r) / chart.slots,
								"--w": 1 / chart.slots,
								"--v": max > 0 ? Math.max(0, (r[chart.value] as number) ?? 0) / max : 0,
							} as CSSProperties
						}
					/>
				))}
			</div>
			<div className="t-meta qlab__axis" aria-hidden="true">
				<span>{cell(rows[0], chart.x)}</span>
				<span>{cell(rows[rows.length - 1], chart.x)}</span>
			</div>
		</div>
	);
}
