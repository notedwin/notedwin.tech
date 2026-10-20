import tokens from "@notedwin/design/tokens.json";

type Theme = "dark" | "light";

// A color token's literal value for a theme, for places CSS variables can't reach
// (theme-color metas, OG images). Follows {alias} references.
export function color(name: string, theme: Theme = "dark"): string {
	let token = tokens.color.tokens.find((t) => t.name === name);
	if (!token) {
		throw new Error(`unknown color token: ${name}`);
	}
	let value = typeof token.value === "string" ? token.value : token.value[theme];
	let alias = /^\{(.+)\}$/.exec(value);
	return alias ? color(alias[1], theme) : value;
}
