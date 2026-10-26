import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeShiki from "@shikijs/rehype";
import { createCssVariablesTheme } from "shiki/core";
import { TweetComponent } from "./tweet";
import { CaptionComponent } from "./caption";
import { YouTubeComponent } from "./youtube";
import { ImageGrid } from "./image-grid";
import { Results } from "./results";
import { QueryLab } from "./query-lab";
import { proseSizes } from "app/lib/image-sizes";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// Code colors come from --shiki-* variables mapped to tokens in global.css: sage on graphite,
// orange on smoke.
const codeTheme = createCssVariablesTheme({ name: "notedwin", variablePrefix: "--shiki-" });

function CustomLink(props) {
	let href = props.href;
	if (href.startsWith("/")) {
		return (
			<Link href={href} {...props}>
				{props.children}
			</Link>
		);
	}
	if (href.startsWith("#")) {
		return <a {...props} />;
	}
	return <a rel="noopener noreferrer" {...props} />;
}

// Images are evidence: a plate, square, full width of the column.
// Sized to the column, never past the image's own width, so phones get a phone-sized file.
function PlateImage({ className, ...props }: React.ComponentProps<typeof Image>) {
	let max = Number(props.width) || undefined;
	return (
		<span className="prose-plate">
			<Image sizes={proseSizes({ max })} {...props} alt={props.alt ?? ""} />
		</span>
	);
}

function Table({ data }) {
	// Number columns are right-aligned; long text wraps so the numbers stay in view.
	let num = data.headers.map((_, col) => data.rows.every((row) => typeof row[col] === "number"));
	let cellClass = (cell, col) => (num[col] ? "num" : String(cell).length > 32 ? "wrap" : undefined);
	let headers = data.headers.map((header, index) => (
		<th key={index} className={num[index] ? "num" : undefined}>
			{header}
		</th>
	));
	let rows = data.rows.map((row, index) => (
		<tr key={index}>
			{row.map((cell, cellIndex) => (
				<td key={cellIndex} className={cellClass(cell, cellIndex)}>
					{cell}
				</td>
			))}
		</tr>
	));
	return (
		// Focusable so keyboard readers can scroll a wide table.
		<div className={`table-wrap${data.headers.length >= 6 ? " table-wrap--wide" : ""}`} tabIndex={0} role="region" aria-label={`table: ${data.headers.join(", ")}`}>
			<table>
				<thead>
					<tr>{headers}</tr>
				</thead>
				<tbody>{rows}</tbody>
			</table>
		</div>
	);
}

function Strikethrough(props) {
	return <del {...props} />;
}

// No emoji in the interface: a callout is a note with a label.
function Callout({ children }) {
	return (
		<aside className="callout">
			<span className="t-meta callout__label">note</span>
			<div>{children}</div>
		</aside>
	);
}

// Plain text of a heading's children, so **bold** or `code` in a heading still gives a real id.
function textOf(node): string {
	if (node == null || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textOf).join("");
	return textOf(node.props?.children);
}

function slugify(str) {
	return str
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/&/g, "-and-")
		.replace(/[^\w\-]+/g, "")
		.replace(/\-\-+/g, "-");
}

function createHeading(level) {
	const Heading = ({ children }) => {
		let slug = slugify(textOf(children));
		return React.createElement(
			`h${level}`,
			{ id: slug },
			children,
			React.createElement("a", {
				href: `#${slug}`,
				key: `link-${slug}`,
				className: "anchor",
				"aria-label": "link to this section",
			})
		);
	};
	Heading.displayName = `Heading${level}`;
	return Heading;
}

let components = {
	// A post's title is the page h1; headings inside a post start at h2.
	h1: createHeading(2),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	h5: createHeading(5),
	h6: createHeading(6),
	Image: PlateImage,
	ImageGrid,
	a: CustomLink,
	StaticTweet: TweetComponent,
	Caption: CaptionComponent,
	YouTube: YouTubeComponent,
	Table,
	del: Strikethrough,
	Callout,
	KatexStyles,
	Results,
	QueryLab,
};

// An <Image> in a post's opening blocks is likely its LCP element: load it eagerly at high
// priority instead of lazily.
function remarkLeadImage() {
	return (tree) => {
		let lead = tree.children
			.slice(0, 4)
			.find((node) => node.type?.startsWith("mdxJsx") && node.name === "Image");
		lead?.attributes.push(
			{ type: "mdxJsxAttribute", name: "loading", value: "eager" },
			{ type: "mdxJsxAttribute", name: "fetchPriority", value: "high" }
		);
	};
}

// KaTeX's stylesheet (copied to public/katex from katex@0.19.0's dist) blocks rendering, so
// only posts with math load it: this inserts <KatexStyles /> when remark-math found any.
function remarkKatexStyles() {
	return (tree) => {
		let found = false;
		let walk = (node) => {
			if (node.type === "math" || node.type === "inlineMath") found = true;
			node.children?.forEach(walk);
		};
		walk(tree);
		if (found) tree.children.unshift({ type: "mdxJsxFlowElement", name: "KatexStyles", attributes: [], children: [] });
	};
}

function KatexStyles() {
	return <link rel="stylesheet" href="/katex/katex.min.css" precedence="default" />;
}

export function CustomMDX(props) {
	return (
		<MDXRemote
			{...props}
			components={{ ...components, ...(props.components || {}) }}
			options={{
				// Posts are our own files and use JSX props like width={640}.
				blockJS: false,
				mdxOptions: {
					// Only $$…$$ is math: posts use single $ for prices ("$10 router … $10 camera").
					remarkPlugins: [[remarkMath, { singleDollarTextMath: false }], remarkLeadImage, remarkKatexStyles],
					rehypePlugins: [rehypeKatex, [rehypeShiki, { theme: codeTheme, inline: "tailing-curly-colon" }]],
				},
			}}
		/>
	);
}
