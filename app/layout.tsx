import "./global.css";
import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "./components/header";
import Footer from "./components/footer";
import { metaData } from "./config";
import { color } from "./lib/tokens";
import { themeScript } from "./lib/theme";

// Three faces, each with one job (design system → Typography).
const sans = Instrument_Sans({
	subsets: ["latin"],
	axes: ["wdth"],
	// No italic file: posts use few <em>, and the synthesized slant saves a 57 KB preload.
	variable: "--nf-sans",
	display: "swap",
});
const mono = localFont({
	src: [
		{ path: "./fonts/CommitMono-Regular.woff2", weight: "400" },
		{ path: "./fonts/CommitMono-SemiBold.woff2", weight: "500 700" },
	],
	variable: "--nf-mono",
	display: "swap",
	// Only the sans (the LCP text) is preloaded; the monos load as CSS asks for them.
	preload: false,
	fallback: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
	adjustFontFallback: false,
});
const pixel = localFont({
	src: "./fonts/DepartureMono-Regular.woff2",
	weight: "400",
	variable: "--nf-pixel",
	display: "swap",
	preload: false,
	fallback: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
	adjustFontFallback: false,
});

export const metadata: Metadata = {
	metadataBase: new URL(metaData.baseUrl),
	title: {
		default: metaData.title,
		template: `%s | ${metaData.title}`,
	},
	description: metaData.description,
	openGraph: {
		images: metaData.ogImage,
		title: metaData.title,
		description: metaData.description,
		url: metaData.baseUrl,
		siteName: metaData.name,
		locale: "en_US",
		type: "website",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	twitter: {
		title: metaData.name,
		card: "summary_large_image",
		site: "@mu0xide",
	},
	icons: {
		icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }],
	},
	alternates: {
		types: {
			"application/rss+xml": "/rss.xml",
			"application/atom+xml": "/atom.xml",
			"application/feed+json": "/feed.json",
		},
	},
};

export const viewport: Viewport = {
	colorScheme: "dark light",
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: color("ground", "dark") },
		{ media: "(prefers-color-scheme: light)", color: color("ground", "light") },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		// data-theme is set before hydration by themeScript.
		<html lang="en" className={`${sans.variable} ${mono.variable} ${pixel.variable}`} suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<a className="skip-link" href="#main">
					skip to content
				</a>
				<div className="ne-col site">
					<Header />
					{children}
					<Footer />
				</div>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
