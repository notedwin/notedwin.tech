"use client";

import { useEffect, useRef } from "react";
import { ditherField, mix, onThemeChange, tok } from "./ink";

// The home page's eye-grabber, from the design system's Cube component. Each face is a
// 52px value field in the photo dither on a fixed dark base. Three inks, two faces each, on
// opposite sides (front/back, right/left, top/bottom), so every corner shows all three: sage, an
// ember mixed 60% toward the base (a glow, not a signal), and the page's own ground, which follows
// the theme.
// The base is the fixed brand char, the same in both themes, so the cube stays a dark object.
const base = () => tok("--char");
const FACES: [(x: number, y: number) => number, () => string][] = [
	[(x, y) => 0.25 + 0.6 * (1 - y), () => tok("--ash-300")],
	[(x) => 0.3 + 0.5 * x, () => tok("--ash-300")],
	[(x, y) => 0.15 + 0.75 * Math.hypot(x - 0.3, y - 0.3), () => mix(tok("--flame-shadow"), base(), 0.6)],
	[(x, y) => 0.5 + 0.4 * Math.sin(x * 6) * Math.cos(y * 6), () => mix(tok("--flame-shadow"), base(), 0.6)],
	[(x, y) => 0.85 - 0.6 * y, () => tok("--ground")],
	[(x, y) => 0.45 + 0.35 * Math.cos(x * 4 + y * 3), () => tok("--ground")],
];

export function Cube() {
	let ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		let paint = () => {
			let faces = ref.current!.children;
			FACES.forEach(([field, ink], i) => {
				let c = document.createElement("canvas");
				c.width = c.height = 52;
				ditherField(c.getContext("2d")!, 52, 52, (x, y) => field(x / 52, y / 52), base(), ink());
				(faces[i] as HTMLElement).style.backgroundImage = `url(${c.toDataURL()})`;
			});
		};
		paint();
		return onThemeChange(paint);
	}, []);
	return (
		<div className="ne-stage" aria-hidden="true">
			<div className="ne-cube" ref={ref}>
				{FACES.map((_, i) => (
					<i key={i} />
				))}
			</div>
		</div>
	);
}
