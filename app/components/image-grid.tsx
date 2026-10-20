import React from "react";
import Image from "next/image";
import { proseSizes } from "app/lib/image-sizes";

interface ImageGridProps {
	images: {
		src: string;
		alt: string;
		href?: string;
	}[];
	columns?: 2 | 3 | 4;
}

// A grid of square plates inside a post.
export const ImageGrid: React.FC<ImageGridProps> = ({ images, columns = 3 }) => {
	return (
		<div className="image-grid" style={{ "--cols": columns } as React.CSSProperties}>
			{images.map((image) => {
				let img = <Image alt={image.alt} src={image.src} fill sizes={proseSizes({ cols: columns })} />;
				return (
					<div key={image.src} className="ne-plate image-grid__cell">
						{image.href ? (
							<a rel="noopener noreferrer" href={image.href}>
								{img}
							</a>
						) : (
							img
						)}
					</div>
				);
			})}
		</div>
	);
};
