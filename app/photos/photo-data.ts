export type Photo = { src: string; alt: string; href?: string };

export const photos: Photo[] = [
	{ src: "/photos/9.png", alt: "cloud" },
	{ src: "/photos/1.png", alt: "pollock" },
	{ src: "/photos/6.png", alt: "pink sunset" },
	{ src: "/photos/bob.gif", alt: "Bob Esponge" },
	{ src: "/photos/5.png", alt: "tv" },
	{ src: "/photos/2.png", alt: "bike" },
	{ src: "/photos/10.png", alt: "server" },
	{ src: "/photos/7.png", alt: "blue sunset" },
	{ src: "/photos/8.png", alt: "dark paintings" },
	{ src: "/photos/chelsea.jpg", alt: "Chelsea", href: "https://www.chelseafc.com/en" },
	{ src: "/photos/arch.jpg", alt: "arch linux" },
	{ src: "/photos/3.png", alt: "gumwall" },
];
