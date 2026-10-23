"""The Perspective 5.5 theme for perspective-python.

The theme is CSS read by the viewer in the browser, so it has to reach the page that shows the
viewer, next to Perspective's own base theme CSS:

- Jupyter: run `perspective.jupyter()` once, then
  `PerspectiveWidget(table, theme=perspective.theme_name("dark"))`.
- A server (Tornado, Starlette, ...): serve `perspective.css()` as a stylesheet, or write it
  to your static folder with `perspective.write_css(path)`, and link it after the base theme.
"""

from __future__ import annotations

import json
from importlib.resources import files
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from . import Theme

_data = files(__package__).joinpath("data")

THEMES: dict[str, str] = json.loads(_data.joinpath("themes.json").read_text())


def theme_name(theme: "Theme" = "dark") -> str:
    """The registered theme name: "notedwin graphite" (dark) or "notedwin smoke" (light)."""
    return THEMES[theme]


def css() -> str:
    """Both themes as one stylesheet. Load it after @perspective-dev/viewer's base theme CSS."""
    return _data.joinpath("perspective.css").read_text()


def write_css(path: str | Path) -> Path:
    """Write the stylesheet to path (a file, or a folder for notedwin-perspective.css)."""
    target = Path(path)
    if target.is_dir():
        target = target / "notedwin-perspective.css"
    target.write_text(css())
    return target


def jupyter():
    """Inject the themes into the current notebook so PerspectiveWidget can use them."""
    from IPython.display import HTML, display

    display(HTML(f"<style>{css()}</style>"))
