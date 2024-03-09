import Head from "next/head";
import Navbar from "../components/navbar";
import Meta from "../components/meta";

export default function ResumePage() {
	return (
		<>
			<Meta />
			<Head>
				<title>Edwin Zamudio</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Navbar />
			<article>
				<h1>About Me</h1>
				<div className="about">
					<p>Hey there!</p>
					<p>I'm Edwin, a Data Engineer based in Chicago.</p>
					<p>
						I'm currently working at Amgen as a Data Engineer. I have an
						interest in building impactful data systems like{" "}
						<a href="https://map.notedwin.com"> this. </a>
					</p>
					<p>
						In my free time, I enjoy playing soccer, biking and learning new
						things, failing leetcode mediums, and turning electricity into heat.
					</p>
					<h2>Technical Areas of Interests</h2>
					<ul>
						<li>Backend Systems</li>
						<li>Data Systems</li>
						<li>Cloud Computing</li>
						<li>Using duckdb as a hammer</li>
					</ul>
					<h2>Technical Skills</h2>
					<ul>
						<li>Languages: Python, SQL</li>
						<li>Cloud Platforms: AWS, GCP</li>
						<li>
							Other keywords: pyspark, duckdb, dagster, ansible, terraform,
							linux
						</li>
					</ul>
					<p>
						You can
						<a href="http://github.com/notedwin/notedwin.tech/issues/new">
							{" "}
							report{" "}
						</a>
						if there is a broken link(s) or something else.
					</p>
				</div>
			</article>
		</>
	);
}
