"use client";

import { useEffect, useState } from "react";

function age(date: string) {
	let minutes = Math.max(0, (Date.now() - Date.parse(date)) / 60_000);
	if (minutes < 60) return `${Math.round(minutes)}m ago`;
	if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
	if (minutes < 60 * 24 * 60) return `${Math.round(minutes / 60 / 24)}d ago`;
	return `${Math.round(minutes / 60 / 24 / 30)}mo ago`;
}

// Server renders the age at build/revalidate time; the client refreshes it on load.
export function RelativeTime({ date }: { date: string }) {
	let [label, setLabel] = useState(() => age(date));
	useEffect(() => setLabel(age(date)), [date]);
	return (
		<time dateTime={date} suppressHydrationWarning>
			{label}
		</time>
	);
}
