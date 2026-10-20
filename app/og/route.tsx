import { ImageResponse } from "next/og";
import { metaData } from "app/config";
import { color } from "app/lib/tokens";

// Graphite ground, ink title, the ember square from the commit line as the one signal.
export function GET(request: Request) {
	let url = new URL(request.url);
	let title = url.searchParams.get("title") || metaData.title;

	return new ImageResponse(
		(
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					width: "100%",
					height: "100%",
					padding: 80,
					background: color("ground"),
					color: color("ink"),
					borderLeft: `1px solid ${color("rule")}`,
					borderRight: `1px solid ${color("rule")}`,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, color: color("ink-muted") }}>
					<div style={{ width: 14, height: 14, background: color("ember") }} />
					notedwin
				</div>
				<div style={{ display: "flex", fontSize: 72, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
					{title}
				</div>
			</div>
		),
		{ width: 1200, height: 630 }
	);
}
