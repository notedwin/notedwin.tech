"""Chart palettes, following the design system's data-viz rules.

Color in a chart means a domain or a state, never decoration:
- categorical: infra (ash), data (ember), play (ink); more series fall back to quiet neutrals
- highlight: one series in its domain fill, the rest in ink-faint (the default view)
- sequential: a domain's wash to its ink
- diverging: infra-ink (below) through rule (zero) to ember-ink (above)
- status: signal-live, signal-warn, signal-error, always shown with a word
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Literal

if TYPE_CHECKING:
    from . import Theme

Domain = Literal["infra", "data", "play"]


def _c(name: str, theme: "Theme") -> str:
    from . import color

    return color(name, theme)


def categorical(theme: "Theme" = "dark") -> list[str]:
    """The three domain colors: infra, data, play."""
    return [_c("infra", theme), _c("data", theme), _c("play", theme)]


def series(n: int, theme: "Theme" = "dark") -> list[str]:
    """n series colors: the three domains, then ink-muted and ink-faint alternating.
    Past three series, label lines directly instead of relying on color. (data-viz.md names
    ash-500, but that fixed brand color falls under 3:1 on smoke.)"""
    out = categorical(theme)
    quiet = [_c("ink-muted", theme), _c("ink-faint", theme)]
    while len(out) < n:
        out.append(quiet[(len(out) - 3) % 2])
    return out[:n]


def highlight(n: int, i: int, theme: "Theme" = "dark", domain: Domain = "data") -> list[str]:
    """n series where series i takes the domain fill and the rest recede to ink-faint."""
    if not 0 <= i < n:
        raise IndexError(f"highlight index {i} out of range for {n} series")
    faint = _c("ink-faint", theme)
    return [_c(domain, theme) if k == i else faint for k in range(n)]


def sequential(domain: Domain = "infra", theme: "Theme" = "dark") -> tuple[str, str]:
    """(low, high) for a sequential ramp in one domain: its wash to its ink."""
    return _c(f"{domain}-wash", theme), _c(f"{domain}-ink", theme)


def diverging(theme: "Theme" = "dark") -> tuple[str, str, str]:
    """(below, zero, above): infra-ink, rule, ember-ink. Differs in hue and lightness."""
    return _c("infra-ink", theme), _c("rule", theme), _c("ember-ink", theme)


def status(theme: "Theme" = "dark") -> dict[str, str]:
    """System state colors. Always pair them with a word (and a shape) in the chart."""
    return {s: _c(f"signal-{s}", theme) for s in ("live", "warn", "error")}


def surface(theme: "Theme" = "dark") -> dict[str, str]:
    """Chart chrome: background, text, muted text, grid and axis colors."""
    return {
        "background": _c("ground-raised", theme),
        "text": _c("ink", theme),
        "muted": _c("ink-muted", theme),
        "grid": _c("rule", theme),
        "axis": _c("ink-faint", theme),
    }
