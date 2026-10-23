"use client";

import { useEffect, useRef } from "react";
import { onThemeChange, reducedMotion, tok } from "./ink";

// Hearth, offset: the 16×16 flame from the design system's Mark component.
// a = outline/body pixel, e/h = inner pixels; the ember shadow is drawn 1px down-right.
const BODY = ["....abbbebbba...", "...abbbeeebbba..", "...abbeeheebba..", "..abbbeehebbba..", "..abbbe..ebbba..", "..abbe....ebba..", "...abe....eba...", "....aa....aa....", "................"];
const TOPS = [
	["................", "........a.......", ".......ab.......", ".......ab.......", "......abb.......", "......abba..a...", ".....abbbb.aa..."],
	[".......a........", ".......a........", ".......ab.......", "......abb...a...", "......abb...a...", "......abba.ab...", ".....abbbb.ab..."],
	["..........h.....", "................", "........a.......", ".......ab.......", "......abb.......", "......abba..a...", ".....abbbb.aa..."],
];
const FRAMES = TOPS.map((top) => [...top, ...BODY]);

// A frame's pixels as [x, y, token]: the ember shadow first, then outline and body over it.
function pixels(frame: number): [number, number, string][] {
	let g = FRAMES[frame];
	let on = (x: number, y: number) => g[y]?.[x] !== undefined && g[y][x] !== ".";
	let out: [number, number, string][] = [];
	g.forEach((row, y) =>
		[...row].forEach((c, x) => {
			if (c !== "." && !on(x + 1, y + 1)) out.push([x + 1, y + 1, "--flame-shadow"]);
		})
	);
	g.forEach((row, y) =>
		[...row].forEach((c, x) => {
			if (c !== ".") out.push([x, y, on(x - 1, y) ? "--flame-body" : "--flame-outline"]);
		})
	);
	return out;
}

function paint(ctx: CanvasRenderingContext2D, frame: number) {
	ctx.clearRect(0, 0, 16, 16);
	let colors: Record<string, string> = {};
	for (let [x, y, token] of pixels(frame)) {
		ctx.fillStyle = colors[token] ??= tok(token);
		ctx.fillRect(x, y, 1, 1);
	}
}

// Frame 1 as SVG, rendered on the server: the mark shows before (or without) JS. Fills are
// tokens, so it follows the theme. Hidden once the canvas has drawn.
const FIRST = pixels(0);

// Animated only in the site header; frame 1 everywhere else and under reduced motion.
export function Flame({ animate = false }: { animate?: boolean }) {
	let ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		let ctx = ref.current!.getContext("2d")!;
		let frame = 0;
		let draw = () => paint(ctx, frame);
		draw();
		ref.current!.parentElement!.dataset.drawn = "";
		let stop = onThemeChange(draw);
		let timer =
			animate && !reducedMotion()
				? setInterval(() => {
						frame = (frame + 1) % FRAMES.length;
						draw();
					}, 230)
				: undefined;
		return () => {
			stop();
			clearInterval(timer);
		};
	}, [animate]);
	return (
		<span className="ne-mark" aria-hidden="true">
			<svg viewBox="0 0 16 16" shapeRendering="crispEdges">
				{FIRST.map(([x, y, token]) => (
					<rect key={`${x}-${y}-${token}`} x={x} y={y} width={1} height={1} fill={`var(${token})`} />
				))}
			</svg>
			<canvas ref={ref} className="ne-flame" width={16} height={16} />
		</span>
	);
}
