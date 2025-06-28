export interface Project {
	title: string;
	year: number;
	description: string;
	url: string;
}

export const projects: Project[] = [
	{
		title: "Homelab",
		year: 2020,
		description: "Homelab config",
		url: "https://github.com/notedwin/ansible-compose",
	},
	{
		title: "HaxML",
		year: 2021,
		description: "ML to predict expected goals",
		url: "/blog/haxml",
	},
	{
		title: "measurements",
		year: 2024,
		description: "a collection of measurements on myself",
		url: "https://how.notedwin.com/",
	},
	{
		title: "chicago",
		year: 2024,
		description: "attempt at a google maps alternative",
		url: "https://chicago.notedwin.com/",
	},
	{
		title: "tiny-spider",
		year: 2024,
		description: "scheduled tasks for personal data",
		url: "https://github.com/notedwin/tiny_spider",
	},
];
