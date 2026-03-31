"""Rasterize the VaporLang mark to logo.png (geometry aligned with logo.svg)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

SIZE = 512


def main() -> None:
    im = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im, "RGBA")

    outer = [(96, 120), (256, 420), (416, 120), (344, 120), (256, 310), (168, 120)]
    draw.polygon(outer, fill=(109, 143, 248, 255))

    middle = [(144, 100), (256, 340), (368, 100), (312, 100), (256, 230), (200, 100)]
    draw.polygon(middle, fill=(34, 211, 238, 140))

    inner = [(200, 100), (256, 230), (312, 100)]
    draw.polygon(inner, fill=(255, 255, 255, 90))

    out = Path(__file__).resolve().parent.parent / "logo.png"
    im.save(out, "PNG")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
