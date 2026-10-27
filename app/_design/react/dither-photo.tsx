"use client";

import { useCallback, useEffect, useRef, type ReactNode, type Ref } from "react";
import { ditherImage, onThemeChange } from "./ink";

// What DitherPhoto passes to the color layer. Spread it onto an <img> or a framework image
// component (next/image with `fill`) and keep the ref, onLoad and empty alt.
export type DitherImageProps = {
	ref: Ref<HTMLImageElement>;
	src: string;
	alt: "";
	onLoad: () => void;
	"aria-hidden": true;
};

type Props = {
	src: string;
	// Describes the photo; empty marks the plate decorative (hidden, not focusable).
	alt: string;
	// Sizes the plate (an aspect-ratio or a fixed box), plus anything else for the wrapper.
	className?: string;
	// Renders the color layer. Defaults to a lazy <img>; pass next/image for optimized sources:
	// renderImage={(p) => <Image {...p} fill sizes="260px" />}
	renderImage?: (props: DitherImageProps) => ReactNode;
};

const plainImage = (props: DitherImageProps) => <img {...props} loading="lazy" decoding="async" />;

// A photo printed in the pixel language: a two-ink 8×8 ordered dither, one image pixel per
// device pixel, with the original fading in on hover or focus. The plate is focusable so
// keyboard readers get the color too. The dither is drawn from the color layer's own source,
// so each photo downloads once. The original shows until the dither has drawn (`data-drawn`).
export function DitherPhoto({ src, alt, className = "", renderImage = plainImage }: Props) {
	let canvas = useRef<HTMLCanvasElement>(null);
	let img = useRef<HTMLImageElement>(null);
	// A plain Image of the URL the color layer chose (already cached). Drawing a srcset <img>
	// itself crops at the wrong scale in Chrome, where its natural size is density-corrected.
	let bitmap = useRef<HTMLImageElement | null>(null);

	let draw = useCallback(async (force = false) => {
		let c = canvas.current;
		let url = img.current?.complete ? img.current.currentSrc || img.current.src : "";
		if (!c || !url) return;
		if (bitmap.current?.src !== url) {
			let next = new window.Image();
			next.src = url;
			try {
				await next.decode();
			} catch {
				return;
			}
			bitmap.current = next;
			force = true;
		}
		let source = bitmap.current!;
		let density = window.devicePixelRatio || 1;
		let w = Math.max(1, Math.round(c.clientWidth * density));
		let h = Math.max(1, Math.round(c.clientHeight * density));
		if (!force && c.width === w && c.height === h) return;
		c.width = w;
		c.height = h;
		ditherImage(source, source.naturalWidth, source.naturalHeight, c);
		// Until now the original shows (greyscale), so the plate is never blank before or without
		// JS. The swap is instant: reading the style applies it before the hover fade turns on (a
		// requestAnimationFrame runs before the frame's style pass, so both would land together).
		let plate = c.parentElement!;
		if (!("drawn" in plate.dataset)) {
			plate.dataset.drawn = "";
			if (img.current) getComputedStyle(img.current).opacity;
			plate.dataset.settled = "";
		}
	}, []);

	useEffect(() => {
		draw();
		let resize = new ResizeObserver(() => draw());
		resize.observe(canvas.current!);
		let stop = onThemeChange(() => draw(true));
		return () => {
			resize.disconnect();
			stop();
		};
	}, [draw]);

	return (
		<div
			className={`ne-plate ne-photo ${className}`.trim()}
			{...(alt ? { tabIndex: 0, role: "img", "aria-label": alt } : { "aria-hidden": true })}
		>
			<canvas ref={canvas} width={1} height={1} aria-hidden="true" />
			{renderImage({ ref: img, src, alt: "", onLoad: () => draw(), "aria-hidden": true })}
		</div>
	);
}
