// Browser helpers shared by the pixel components (flame, dither, cube). Ported from the
// design system's Mark, Figure and Cube previews.

export const tok = (name: string) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fires when the theme changes, by toggle (data-theme) or by the system setting.
export function onThemeChange(cb: () => void) {
	let observer = new MutationObserver(cb);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
	let media = matchMedia("(prefers-color-scheme: light)");
	media.addEventListener("change", cb);
	return () => {
		observer.disconnect();
		media.removeEventListener("change", cb);
	};
}

const BAYER = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[60, 28, 52, 20, 62, 30, 54, 22],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 49, 17, 57, 25],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[63, 31, 55, 23, 61, 29, 53, 21],
];
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

// Two-ink 8×8 ordered dither of a value field (0..1 per pixel); bright values take the lighter ink.
export function ditherField(
	ctx: CanvasRenderingContext2D,
	w: number,
	h: number,
	value: (x: number, y: number) => number,
	inkA: string,
	inkB: string
) {
	let [a, b] = [rgb(inkA), rgb(inkB)];
	if (lum(b) < lum(a)) {
		[a, b] = [b, a];
	}
	let img = ctx.createImageData(w, h);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			let v = Math.max(0, Math.min(1, value(x, y))) * 64;
			let c = v > BAYER[y % 8][x % 8] + 0.5 ? b : a;
			let o = (y * w + x) * 4;
			img.data[o] = c[0];
			img.data[o + 1] = c[1];
			img.data[o + 2] = c[2];
			img.data[o + 3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
}

// Downscale in halving steps with smoothing, so fine texture averages out instead of
// aliasing into speckle that the dither would then exaggerate.
function downscale(src: CanvasImageSource, sw: number, sh: number, w: number, h: number) {
	let scale = Math.max(w / sw, h / sh);
	let cw = w / scale;
	let ch = h / scale;
	let step = document.createElement("canvas");
	let sx = (sw - cw) / 2;
	let sy = (sh - ch) / 2;
	let [curW, curH] = [cw, ch];
	let source: CanvasImageSource = src;
	while (curW / 2 > w && curH / 2 > h) {
		let next = document.createElement("canvas");
		next.width = Math.round(curW / 2);
		next.height = Math.round(curH / 2);
		let nc = next.getContext("2d")!;
		nc.imageSmoothingQuality = "high";
		nc.drawImage(source, sx, sy, curW, curH, 0, 0, next.width, next.height);
		[source, sx, sy, curW, curH] = [next, 0, 0, next.width, next.height];
	}
	step.width = w;
	step.height = h;
	let sc = step.getContext("2d", { willReadFrequently: true })!;
	sc.imageSmoothingQuality = "high";
	sc.drawImage(source, sx, sy, curW, curH, 0, 0, w, h);
	return sc.getImageData(0, 0, w, h).data;
}

// neDither: prints an image (cropped to cover) in the photo dither, one image pixel per
// canvas pixel. Contrast is gently stretched (gain capped at 1.4) so dark or flat images keep
// their shapes without turning texture into noise.
export function ditherImage(src: CanvasImageSource, sw: number, sh: number, dst: HTMLCanvasElement) {
	let { width: w, height: h } = dst;
	let d = downscale(src, sw, sh, w, h);
	let n = w * h;
	let values = new Uint8Array(n);
	let histogram = new Uint32Array(256);
	for (let i = 0; i < n; i++) {
		let o = i * 4;
		let v = (0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2]) | 0;
		values[i] = v;
		histogram[v]++;
	}
	let percentile = (p: number) => {
		let target = n * p;
		for (let v = 0, seen = 0; v < 256; v++) {
			seen += histogram[v];
			if (seen >= target) return v;
		}
		return 255;
	};
	let lo = percentile(0.02);
	let hi = percentile(0.98);
	// Never stretch more than 1.4×: widen a narrow range around its middle instead.
	let span = Math.max(hi - lo, 255 / 1.4);
	let base = Math.max(0, Math.min((lo + hi) / 2 - span / 2, 255 - span));
	ditherField(
		dst.getContext("2d")!,
		w,
		h,
		(x, y) => (values[y * w + x] - base) / span,
		tok("--ground-sunk"),
		tok("--flame-body")
	);
}
