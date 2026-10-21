"use client";

import { useEffect, useRef } from "react";
import { ditherField, onThemeChange, tok } from "./ink";

// A data plate for a post with no image: a smooth value field, seeded by the post's slug so
// each post keeps its own pattern, printed in the photo dither and inks.
function seeded(seed: string) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
	return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296);
}

export function FieldPlate({ seed, className = "" }: { seed: string; className?: string }) {
	let canvas = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		let rand = seeded(seed);
		let [a, b, p, q, tilt] = [2 + rand() * 4, 1 + rand() * 3, rand() * 6.28, rand() * 6.28, rand() - 0.5];
		let draw = () => {
			let c = canvas.current!;
			// One field pixel per 2 device pixels, as for photos.
			let density = (window.devicePixelRatio || 1) / 2;
			c.width = Math.max(1, Math.round(c.clientWidth * density));
			c.height = Math.max(1, Math.round(c.clientHeight * density));
			let [w, h] = [c.width, c.height];
			ditherField(
				c.getContext("2d")!,
				w,
				h,
				(x, y) => {
					let [u, v] = [x / w, y / h];
					return 0.5 + 0.28 * Math.sin(u * a + p) * Math.cos(v * b + q) + 0.3 * tilt * (u - 0.5);
				},
				tok("--ground-sunk"),
				tok("--dither-ink")
			);
		};
		draw();
		let resize = new ResizeObserver(draw);
		resize.observe(canvas.current!);
		let stop = onThemeChange(draw);
		return () => {
			resize.disconnect();
			stop();
		};
	}, [seed]);
	return (
		<div className={`ne-plate ne-photo ${className}`} aria-hidden="true">
			<canvas ref={canvas} width={1} height={1} />
		</div>
	);
}
