"use client";

import React from "react";
import {
	FaGithub,
	FaSpotify,
	FaRss,
	FaLinkedinIn,
	FaPhotoFilm,
} from "react-icons/fa6";
import { BsSubstack } from "react-icons/bs";
import { metaData, socialLinks } from "app/config";

const YEAR = new Date().getFullYear();

function SocialLink({ href, icon: Icon }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="hover:text-orange-500"
		>
			<Icon />
		</a>
	);
}

function SocialLinks() {
	return (
		<div className="flex text-2xl gap-3.5 float-right transition-opacity duration-300 hover:opacity-90">
			<SocialLink href={socialLinks.github} icon={FaGithub} />
			<SocialLink href={socialLinks.spotify} icon={FaSpotify} />
			<SocialLink href={socialLinks.linkedin} icon={FaLinkedinIn} />
			<SocialLink href={socialLinks.substack} icon={BsSubstack} />
			<SocialLink href={socialLinks.arena} icon={FaPhotoFilm} />
			<a href="/rss.xml" target="_self" className="hover:text-orange-500">
				<FaRss />
			</a>
		</div>
	);
}

export default function Footer() {
	return (
		<small className="block lg:mt-24 mt-16 text-[#1C1C1C] dark:text-[#D4D4D4]">
			<time>© {YEAR}</time>{" "}
			<a
				className="no-underline"
				href={socialLinks.github}
				target="_blank"
				rel="noopener noreferrer"
			>
				{metaData.title}
			</a>
			<style jsx>{`
				@media screen and (max-width: 480px) {
					article {
						padding-top: 2rem;
						padding-bottom: 4rem;
					}
				}
			`}</style>
			<SocialLinks />
		</small>
	);
}
