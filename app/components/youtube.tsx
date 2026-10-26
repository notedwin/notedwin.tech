"use client";
import { useState } from "react";

// Nothing loads from YouTube until the reader presses play: the player, its scripts and its ad
// requests come with the click, not with the page.
export function YouTubeComponent({ videoId, title = "YouTube video" }: { videoId: string; title?: string }) {
	let [playing, setPlaying] = useState(false);
	return (
		<span className="ne-plate video-plate">
			{playing ? (
				<iframe
					className="video-plate__frame"
					src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
					title={title}
					allow="autoplay; encrypted-media; picture-in-picture"
					allowFullScreen
				/>
			) : (
				<button type="button" className="ne-btn ne-btn--secondary video-plate__play" onClick={() => setPlaying(true)}>
					play video · youtube
				</button>
			)}
		</span>
	);
}
