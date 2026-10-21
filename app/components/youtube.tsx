"use client";
import YT from "react-youtube";

export function YouTubeComponent(props: any) {
	return (
		<span className="ne-plate video-plate">
			<YT opts={{ height: "100%", width: "100%" }} {...props} className="video-plate__frame" />
		</span>
	);
}
