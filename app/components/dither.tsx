"use client";

import Image from "next/image";
import { DitherPhoto as Plate } from "../_design/react/dither-photo";

type Props = {
	src: string;
	alt: string;
	// Sizes hint for the color layer, as for next/image.
	sizes: string;
	className?: string;
};

// The design package's DitherPhoto with next/image as the color layer, so the dither and the
// hover color share one optimized download. GIFs stay unoptimized (Next can't resize them).
export function DitherPhoto({ src, alt, sizes, className }: Props) {
	return (
		<Plate
			src={src}
			alt={alt}
			className={className}
			renderImage={(p) => <Image {...p} fill sizes={sizes} unoptimized={src.endsWith(".gif")} />}
		/>
	);
}
