"""notedwin ash & ember design system for Python.

Tokens come from the same tokens.json as the CSS and React packages (copied into data/ by
build/generate.mjs), so a chart in a notebook uses exactly the site's colors.

    from notedwin_design import color, palette, perspective
    color("ink")                      # "#eef2f1" (graphite is the default theme)
    palette.series(5, theme="light")  # infra, data, play, then quiet neutrals
    perspective.theme_name("dark")    # "notedwin graphite"
"""

from __future__ import annotations

import json
from functools import cache
from importlib.resources import files
from typing import Literal

from . import palette, perspective

Theme = Literal["dark", "light"]

__all__ = ["Theme", "tokens", "color", "palette", "perspective"]


@cache
def tokens() -> dict:
    """The full tokens.json."""
    return json.loads(files(__package__).joinpath("data/tokens.json").read_text())


def color(name: str, theme: Theme = "dark") -> str:
    """A color token's hex value in a theme, following {alias} references."""
    by_name = {t["name"]: t for t in tokens()["color"]["tokens"]}
    if name not in by_name:
        raise KeyError(f"unknown color token: {name}")
    value = by_name[name]["value"]
    if isinstance(value, dict):
        value = value.get(theme) or next(iter(value.values()))
    if value.startswith("{") and value.endswith("}"):
        return color(value[1:-1], theme)
    return value
