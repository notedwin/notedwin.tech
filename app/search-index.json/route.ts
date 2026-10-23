import { buildIndex } from "app/lib/search";
import { getSearchDocs } from "app/lib/search-docs";

export const dynamic = "force-static";

// The blog's BM25 index, built with the site. /blog fetches it the first time someone reaches for search.
export function GET() {
	return Response.json(buildIndex(getSearchDocs()));
}
