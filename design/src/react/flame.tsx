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

function paint(ctx: CanvasRenderingContext2D, frame: number) {
	let g = FRAMES[frame];
	let on = (x: number, y: number) => g[y]?.[x] !== undefined && g[y][x] !== ".";
	ctx.clearRect(0, 0, 16, 16);
	ctx.fillStyle = tok("--flame-shadow");
	g.forEach((row, y) =>
		[...row].forEach((c, x) => {
			if (c !== "." && !on(x + 1, y + 1)) ctx.fillRect(x + 1, y + 1, 1, 1);
		})
	);
	let outline = tok("--flame-outline");
	let body = tok("--flame-body");
	g.forEach((row, y) =>
		[...row].forEach((c, x) => {
			if (c === ".") return;
			ctx.fillStyle = on(x - 1, y) ? body : outline;
			ctx.fillRect(x, y, 1, 1);
		})
	);
}

// Animated only in the site header; frame 1 everywhere else and under reduced motion.
export function Flame({ animate = false }: { animate?: boolean }) {
	let ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		let ctx = ref.current!.getContext("2d")!;
		let frame = 0;
		let draw = () => paint(ctx, frame);
		draw();
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
	return <canvas ref={ref} className="ne-flame" width={16} height={16} aria-hidden="true" />;
}
