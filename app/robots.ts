import type { MetadataRoute } from "next";
import { metaData } from "./config";

// Every crawler, search and AI alike, may read everything.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: "*", allow: "/" }],
		sitemap: `${metaData.baseUrl}/sitemap.xml`,
	};
}
