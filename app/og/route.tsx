import { ImageResponse } from "next/og";
import { metaData } from "app/config";
import { ogSizes, type OgSize } from "app/lib/seo";
import { color } from "app/lib/tokens";

// How much of the large card's type and spacing each size keeps. The square has room for larger type
// than a straight third of the large card would give it.
const scale: Record<OgSize, number> = { large: 1, medium: 0.5, small: 0.45 };

// Graphite ground, ink title, the ember square from the commit line as the one signal.
// `?size=medium|small` draws the smaller cards; anything else draws the large one.
export function GET(request: Request) {
	let url = new URL(request.url);
	let title = url.searchParams.get("title") || metaData.title;
	let param = url.searchParams.get("size");
	let size: OgSize = param === "medium" || param === "small" ? param : "large";
	let k = scale[size];

	return new ImageResponse(
		(
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					width: "100%",
					height: "100%",
					padding: 80 * k,
					background: color("ground"),
					color: color("ink"),
					borderLeft: `1px solid ${color("rule")}`,
					borderRight: `1px solid ${color("rule")}`,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 16 * k, fontSize: 32 * k, color: color("ink-muted") }}>
					<div style={{ width: 14 * k, height: 14 * k, background: color("ember") }} />
					notedwin
				</div>
				<div style={{ display: "flex", fontSize: 72 * k, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
					{title}
				</div>
			</div>
		),
		ogSizes[size]
	);
}
