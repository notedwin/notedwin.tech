import React from "react";
import type { Metadata } from "next";
import { ImageGrid } from "app/components/image-grid";

export const metadata: Metadata = {
	title: "Photos",
	description: "My Photos",
};

export default function Photos() {
	return (
		<section>
			<h1 className="mb-8 text-2xl font-medium tracking-tight">Photos</h1>
			<ImageGrid
				columns={3}
				images={[
					{
						src: "/photos/9.png",
						alt: "cloud",
					},
					{
						src: "/photos/1.png",
						alt: "pollock",
					},
					{
						src: "/photos/6.png",
						alt: "pink sunset",
					},
					{ src: "/photos/bob.gif", alt: "Bob Esponge" },
					{
						src: "/photos/5.png",
						alt: "tv",
					},
					{
						src: "/photos/2.png",
						alt: "bike",
					},
					{
						src: "/photos/4.png",
						alt: "rainbow",
					},

					{
						src: "/photos/7.png",
						alt: "blue sunset",
					},
					{
						src: "/photos/8.png",
						alt: "dark paintings",
					},

					{
						src: "/photos/chelsea.jpg",
						alt: "Chelsea",
						href: "https://www.chelseafc.com/en",
					},

					{ src: "/photos/arch.jpg", alt: "arch linux" },
					{
						src: "/photos/3.png",
						alt: "gumwall",
					},
				]}
			/>
		</section>
	);
}
