// `alt` is the photo's name (its caption); `description` is what a screen reader hears.
export type Photo = { src: string; alt: string; description: string; href?: string };

export const photos: Photo[] = [
	{ src: "/photos/9.webp", alt: "cloud", description: "A retro-style ad for the Turing Pi 2.5 board: “Why rent cloud when you can own the sky?”" },
	{ src: "/photos/1.webp", alt: "pollock", description: "A Jackson Pollock drip painting on a white gallery wall." },
	{ src: "/photos/6.webp", alt: "pink sunset", description: "Pink clouds at sunset over a lakefront path." },
	{ src: "/photos/bob.gif", alt: "Bob Esponge", description: "A pixelated SpongeBob walking." },
	{ src: "/photos/5.webp", alt: "tv", description: "A small CRT TV glowing blue on a wooden plinth in a gallery." },
	{ src: "/photos/2.webp", alt: "bike", description: "A bike leaning against a graffiti wall." },
	{ src: "/photos/10.webp", alt: "server", description: "The homelab server open on the floor: GPU, fans and drives." },
	{ src: "/photos/7.webp", alt: "blue sunset", description: "Clouds over the water and a low island at dusk." },
	{ src: "/photos/8.webp", alt: "dark paintings", description: "Three dark paintings on a white gallery wall." },
	{ src: "/photos/chelsea.webp", alt: "Chelsea", description: "A Chelsea FC meme: win, draw or lose, 10th place.", href: "https://www.chelseafc.com/en" },
	{ src: "/photos/arch.webp", alt: "arch linux", description: "A meme of a bearded man at a server rack: “Yes I'm a linux user, how did you know?”" },
	{ src: "/photos/3.webp", alt: "gumwall", description: "A wall covered in chewed gum, up close." },
];
