import { getLatestCommit } from "app/lib/github";
import { RelativeTime } from "./relative-time";

// The latest public commit, so the page tells you it's alive without a feed. Hidden when the
// GitHub API gives nothing.
export async function CommitLine({ className = "" }: { className?: string }) {
	let commit = await getLatestCommit();
	if (!commit) {
		return null;
	}
	return (
		<p className={`ne-commit ${className}`}>
			<span className="lead">recently committed</span>
			<span aria-hidden="true">·</span>
			<a href={commit.repoUrl}>{commit.repo}</a>
			<span aria-hidden="true">·</span>
			<code title={commit.message}>
				<a href={commit.url}>{commit.message}</a>
			</code>
			<span aria-hidden="true">·</span>
			<RelativeTime date={commit.date} />
		</p>
	);
}
