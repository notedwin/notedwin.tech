import type { Domain, Status } from "app/lib/posts";

export interface Project {
	title: string;
	year: number;
	description: string;
	url: string;
	domain: Domain;
	status: Status;
	// One real number from the project's write-up, leading its description.
	stat?: string;
	// A photo of the project, for a dithered plate.
	image?: string;
	imageAlt?: string;
}

export const projects: Project[] = [
	{
		title: "Homelab",
		year: 2026,
		description: "The servers in my apartment, written up once a year.",
		url: "https://lab.notedwin.com/",
		domain: "infra",
		status: "growing",
		stat: "4 machines.",
		image: "/photos/10.webp",
		imageAlt: "The homelab server",
	},
	{
		title: "HaxML",
		year: 2021,
		description: "A model that predicts expected goals in the online game HaxBall.",
		url: "/blog/haxml",
		domain: "data",
		status: "settled",
		stat: "Right on 75% of goal calls.",
		image: "/assets/haxml/shot-cone.webp",
		imageAlt: "Shot cone from a player to the goal posts on a HaxBall pitch",
	},
	{
		title: "Attack map",
		year: 2022,
		description: "A Raspberry Pi on the internet and a map of everyone who tried to guess its password.",
		url: "/blog/attack-map",
		domain: "infra",
		status: "settled",
		stat: "166,272 login attempts.",
	},
	{
		title: "chicago",
		year: 2024,
		description: "An attempt at a Google Maps alternative.",
		url: "https://chicago.notedwin.com/",
		domain: "infra",
		status: "live",
	},
	{
		title: "measurements",
		year: 2024,
		description: "A collection of measurements on myself.",
		url: "https://how.notedwin.com/",
		domain: "data",
		status: "live",
	},
];

