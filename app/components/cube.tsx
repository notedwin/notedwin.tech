"use client";

import { useEffect, useRef } from "react";
import { ditherField, tok } from "./ink";

// The home page's eye-grabber, from the design system's Cube component. Each face is a
// 52px value field in the photo dither; the inks are fixed so it reads the same in both themes.
const BASE = "#2b302f"; // graphite ground-sunk, fixed by the Cube spec
const FACES: [(x: number, y: number) => number, string][] = [
	[(x, y) => 0.25 + 0.6 * (1 - y), "--ash-300"],
	[(x) => 0.3 + 0.5 * x, "--ash-500"],
	[(x, y) => 0.15 + 0.75 * Math.hypot(x - 0.3, y - 0.3), "--flame-shadow"],
	[(x, y) => 0.5 + 0.4 * Math.sin(x * 6) * Math.cos(y * 6), "--ash-100"],
	[(x, y) => 0.85 - 0.6 * y, "--ash-100"],
	[() => 0.4, "--ash-700"],
];

export function Cube() {
	let ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		let faces = ref.current!.children;
		FACES.forEach(([field, ink], i) => {
			let c = document.createElement("canvas");
			c.width = c.height = 52;
			ditherField(c.getContext("2d")!, 52, 52, (x, y) => field(x / 52, y / 52), BASE, tok(ink));
			(faces[i] as HTMLElement).style.backgroundImage = `url(${c.toDataURL()})`;
		});
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
