// `sizes` for images in a post, from the prose column's rendered width at each breakpoint:
// - below 768px: the viewport minus the .ne-col gutters (2 × space-4) and its two hairline rails
// - 768–1023px: the 66ch measure at body size (709px)
// - 1024px and up: the column beside the rail (880 − 2 × space-12 − rails − rail − space-6 = 558px)
// Keep in step with --measure, --column, --rail and the .ne-col padding.
const GUTTERS = 34;
const MEASURE = 709;
const BESIDE_RAIL = 558;
const GAP = 16; // .image-grid gap (space-4)

// cols: grid columns sharing the width; max: the image's own width, which it never grows past.
export function proseSizes({ cols = 1, max = Infinity }: { cols?: number; max?: number } = {}) {
	let gap = GAP * (cols - 1);
	let cell = (width: number) => Math.min(max, Math.round((width - gap) / cols));
	let fluid = cols === 1 ? `calc(100vw - ${GUTTERS}px)` : `calc((100vw - ${GUTTERS + gap}px) / ${cols})`;
	// On phones the cell grows with the viewport until it reaches the image's own width.
	let fluidEnd = Math.min(767, Math.ceil(max * cols + gap + GUTTERS) - 1);

	let slots: [string, string][] = [
		[`(max-width: ${fluidEnd}px)`, fluid],
		["(max-width: 767px)", `${max}px`],
		["(max-width: 1023px)", `${cell(MEASURE)}px`],
		["", `${cell(BESIDE_RAIL)}px`],
	];
	if (fluidEnd === 767) slots.splice(1, 1);
	// Drop a slot when the next one gives the same width.
	slots = slots.filter(([, size], i) => size !== slots[i + 1]?.[1]);
	return slots.map(([media, size]) => (media ? `${media} ${size}` : size)).join(", ");
}
