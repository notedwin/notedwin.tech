import type { Metadata } from "next";
import { DitherPhoto } from "app/components/dither";
import { PageHead } from "app/components/ne";
import { photos } from "./photo-data";

export const metadata: Metadata = {
	title: "Photos",
	description: "Photos I've taken, printed in the site's dither. Hover or focus one for color.",
};

export default function Photos() {
	return (
		<main id="main">
			<PageHead title="Photos" note={`${photos.length} plates · hover for color`} />
			<div className="photo-grid">
				{photos.map((photo, i) => (
					<figure className="ne-fig" key={photo.src}>
						<DitherPhoto
							src={photo.src}
							alt={photo.alt}
							sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 260px"
							className="ratio-3-2"
						/>
						<figcaption>
							<span>
								<b>fig:{String(i + 1).padStart(2, "0")}</b> · {photo.alt}
							</span>
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
