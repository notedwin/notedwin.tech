import Image from "next/image";
import { socialLinks } from "./config";
import Cube from "./components/cube";

export default function Page() {
	return (
		<section>
			<a href={socialLinks.github} target="_blank">
				<Cube />
				{/* <Image
					src="/profile.png"
					alt="Profile photo"
					className="rounded-full bg-gray-100 block lg:mt-5 mt-0 lg:mb-5 mb-10 mx-auto sm:float-right sm:ml-5 sm:mb-5 grayscale hover:grayscale-0"
					unoptimized
					width={160}
					height={160}
					priority
				/> */}
			</a>
			<h1 className="mb-8 text-2xl font-medium tracking-tight">Hey!</h1>
			<div className="prose prose-neutral dark:prose-invert">
				<p>
					im Edwin, a data engineer at <a href="https://mcdonalds.com">mcd</a>.
					<br />
					In my free time, I am either building out my{" "}
					<a href="https://notedwin.com/blog/homelab">homelab</a> or riding my
					bike.
				</p>
			</div>
		</section>
	);
}
