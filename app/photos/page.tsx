import type { Metadata } from "next";
import { pageMetadata } from "app/lib/seo";
import { DitherPhoto } from "app/components/dither";
import { PageHead } from "app/components/ne";
import { photos } from "./photo-data";

export const metadata: Metadata = pageMetadata({
	title: "Photos",
	description: "Photos I've taken, printed in the site's dither. Hover or tap one for color.",
	path: "/photos",
});

export default function Photos() {
	return (
		<main id="main">
			<PageHead title="Photos" note={`${photos.length} photos`} />
			<div className="photo-grid">
				{photos.map((photo) => (
					<figure className="ne-fig" key={photo.src}>
						<DitherPhoto
							src={photo.src}
							alt={photo.description}
							sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 260px"
							className="ratio-3-2"
						/>
						<figcaption>
							<span>{photo.alt}</span>
							{photo.href && (
								<a href={photo.href} rel="noopener noreferrer">
									↗ link
								</a>
							)}
						</figcaption>
					</figure>
				))}
			</div>
		</main>
	);
}
