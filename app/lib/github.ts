import { socialLinks } from "app/config";

export type Commit = { repo: string; repoUrl: string; message: string; url: string; date: string };

const user = new URL(socialLinks.github).pathname.slice(1);
const headers: HeadersInit = {
	Accept: "application/vnd.github+json",
	...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
};

// Latest public commit for the header's commit line. Cached for an hour; any failure hides the line.
export async function getLatestCommit(): Promise<Commit | null> {
	try {
		let repos = await fetch(
			`https://api.github.com/users/${user}/repos?sort=pushed&per_page=10&type=owner`,
			{ headers, next: { revalidate: 3600 } }
		);
		if (!repos.ok) {
			return null;
		}
		let repo = (await repos.json()).find((r) => !r.fork && !r.private && !r.archived);
		if (!repo) {
			return null;
		}
		let commits = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=1`, {
			headers,
			next: { revalidate: 3600 },
		});
		if (!commits.ok) {
			return null;
		}
		let [latest] = await commits.json();
		if (!latest) {
			return null;
		}
		return {
			repo: repo.name,
			repoUrl: repo.html_url,
			message: latest.commit.message.split("\n")[0],
			url: latest.html_url,
			date: latest.commit.committer?.date ?? latest.commit.author.date,
		};
	} catch {
		return null;
	}
}
