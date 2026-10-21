export type Photo = { src: string; alt: string; href?: string };

export const photos: Photo[] = [
	{ src: "/photos/9.webp", alt: "cloud" },
	{ src: "/photos/1.webp", alt: "pollock" },
	{ src: "/photos/6.webp", alt: "pink sunset" },
	{ src: "/photos/bob.gif", alt: "Bob Esponge" },
	{ src: "/photos/5.webp", alt: "tv" },
	{ src: "/photos/2.webp", alt: "bike" },
	{ src: "/photos/10.webp", alt: "server" },
	{ src: "/photos/7.webp", alt: "blue sunset" },
	{ src: "/photos/8.webp", alt: "dark paintings" },
	{ src: "/photos/chelsea.webp", alt: "Chelsea", href: "https://www.chelseafc.com/en" },
	{ src: "/photos/arch.webp", alt: "arch linux" },
	{ src: "/photos/3.webp", alt: "gumwall" },
];
