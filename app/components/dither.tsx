"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ditherImage, onThemeChange } from "./ink";

type Props = {
	src: string;
	alt: string;
	// Sizes hint for the color layer, as for next/image.
	sizes: string;
	className?: string;
};

// A photo printed in the pixel language: a two-ink dither (one image pixel per 2 screen
// pixels) with the original fading in on hover or focus. The plate is focusable so keyboard
// readers get the color too. Size the plate (aspect ratio or fixed box) with className.
// The dither is drawn from the optimized color layer, so each photo downloads once.
export function DitherPhoto({ src, alt, sizes, className = "" }: Props) {
	let canvas = useRef<HTMLCanvasElement>(null);
	let img = useRef<HTMLImageElement>(null);

	// A plain Image of the URL the color layer chose (already cached). Drawing the srcset
	// <img> itself crops at the wrong scale in Chrome, where its natural size is density-corrected.
	let bitmap = useRef<HTMLImageElement | null>(null);

	let draw = useCallback(async (force = false) => {
		let c = canvas.current;
		let url = img.current?.complete ? img.current.currentSrc : "";
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
		// One image pixel per 2 device pixels (design system → Figures): 1 CSS px on Retina.
		let density = (window.devicePixelRatio || 1) / 2;
		let w = Math.max(1, Math.round(c.clientWidth * density));
		let h = Math.max(1, Math.round(c.clientHeight * density));
		if (!force && c.width === w && c.height === h) return;
		c.width = w;
		c.height = h;
		ditherImage(source, source.naturalWidth, source.naturalHeight, c);
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
			className={`ne-plate ne-photo ${className}`}
			// Decorative plates (empty alt) are hidden and skip the tab order.
			{...(alt ? { tabIndex: 0, role: "img", "aria-label": alt } : { "aria-hidden": true })}
		>
			<canvas ref={canvas} width={1} height={1} aria-hidden="true" />
			<Image ref={img} src={src} alt="" fill sizes={sizes} unoptimized={src.endsWith(".gif")} aria-hidden="true" onLoad={() => draw()} />
		</div>
	);
}
