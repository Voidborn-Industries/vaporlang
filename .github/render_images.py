from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.dirname(os.path.abspath(__file__))

def get_font(size, bold=False):
    for name in ["consola.ttf", "cour.ttf", "lucon.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            pass
    return ImageFont.load_default()

def get_sans(size, bold=False):
    names = ["segoeui.ttf", "segoeuib.ttf", "arial.ttf", "arialbd.ttf"] if not bold else ["segoeuib.ttf", "arialbd.ttf", "segoeui.ttf"]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            pass
    return ImageFont.load_default()


def render_banner():
    W, H = 1200, 300
    img = Image.new("RGB", (W, H), "#08080d")
    draw = ImageDraw.Draw(img)

    for i in range(H):
        r = int(8 + (15 - 8) * i / H)
        g = int(8 + (13 - 8) * i / H)
        b = int(13 + (26 - 13) * i / H)
        draw.line([(0, i), (W, i)], fill=(r, g, b))

    for cx, cy, rx, ry, color, alpha in [
        (360, 130, 350, 200, (139, 92, 246), 25),
        (840, 170, 300, 180, (34, 211, 238), 15),
    ]:
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        for step in range(60, 0, -1):
            frac = step / 60
            a = int(alpha * frac * frac)
            srx = int(rx * frac)
            sry = int(ry * frac)
            od.ellipse([cx - srx, cy - sry, cx + srx, cy + sry], fill=(*color, a))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

    draw.line([(0, 0), (W, 0)], fill=(34, 180, 220), width=1)

    logo_size = 56
    lx, ly = W // 2, 55
    pts_outer = [(lx - 30, ly), (lx, ly + 52), (lx + 30, ly), (lx + 18, ly), (lx, ly + 35), (lx - 18, ly)]
    draw.polygon(pts_outer, fill=(40, 200, 230))
    pts_inner = [(lx - 16, ly), (lx, ly + 30), (lx + 16, ly), (lx + 10, ly), (lx, ly + 20), (lx - 10, ly)]
    overlay2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od2 = ImageDraw.Draw(overlay2)
    od2.polygon(pts_inner, fill=(140, 100, 240, 100))
    img = Image.alpha_composite(img.convert("RGBA"), overlay2).convert("RGB")
    draw = ImageDraw.Draw(img)

    title_font = get_sans(48, bold=True)
    draw.text((W // 2, 140), "VaporLang", fill=(244, 244, 245), font=title_font, anchor="mm")

    sub_font = get_sans(17)
    draw.text((W // 2, 178), "The next-gen, alignment-first programming language", fill=(161, 161, 170), font=sub_font, anchor="mm")

    tag_font = get_font(12)
    tags = ["AI-native", "WASM-first", "Probabilistic", "Open source"]
    total_w = len(tags) * 110 + (len(tags) - 1) * 15
    sx = W // 2 - total_w // 2
    for i, tag in enumerate(tags):
        tx = sx + i * 125 + 55
        ty = 220
        draw.rounded_rectangle([tx - 50, ty - 13, tx + 50, ty + 13], radius=13, outline=(50, 50, 60), width=1)
        draw.text((tx, ty), tag, fill=(113, 113, 122), font=tag_font, anchor="mm")

    draw.line([(0, H - 1), (W, H - 1)], fill=(34, 160, 200), width=1)

    img.save(os.path.join(OUT, "banner.png"), "PNG")
    print("banner.png done")


def render_features():
    W, H = 820, 200
    img = Image.new("RGB", (W, H), "#0a0a0f")
    draw = ImageDraw.Draw(img)

    cards = [
        {"icon": "⟨T⟩", "title1": "Probabilistic", "title2": "Types",
         "d1": "Probably<T>, Maybe<T>,", "d2": "and Vibes — confidence", "d3": "as a first-class value",
         "code": "std::maybe::Probably", "color": (34, 211, 238), "bg": (15, 35, 45)},
        {"icon": "⊕", "title1": "Alignment-First", "title2": "Compiler",
         "d1": "Modules must pass", "d2": "alignment verification", "d3": "before code generation",
         "code": "align! + ALIGNMENT.md", "color": (167, 139, 250), "bg": (25, 15, 45)},
        {"icon": "⊘", "title1": "Training-Data", "title2": "Sovereignty",
         "d1": "forbid_training compiles", "d2": "opt-out metadata into", "d3": "your WASM binary",
         "code": "#![forbid_training]", "color": (244, 114, 182), "bg": (40, 15, 30)},
        {"icon": "⬡", "title1": "Edge-Native", "title2": "Deployment",
         "d1": "One command deploys", "d2": "to 47 edge regions", "d3": "with zero config",
         "code": "vapor deploy", "color": (74, 222, 128), "bg": (15, 35, 15)},
    ]

    card_w = 195
    gap = 10
    title_font = get_sans(14, bold=True)
    desc_font = get_sans(11)
    code_font = get_font(10)
    icon_font = get_sans(24)

    for i, c in enumerate(cards):
        x = i * (card_w + gap)
        cw = card_w if i < 3 else W - x
        draw.rounded_rectangle([x, 0, x + cw, H - 5], radius=12, fill=c["bg"], outline=(*c["color"][:3],), width=1)

        draw.text((x + 20, 30), c["icon"], fill=c["color"], font=icon_font)
        draw.text((x + 20, 62), c["title1"], fill=(228, 228, 231), font=title_font)
        draw.text((x + 20, 80), c["title2"], fill=(228, 228, 231), font=title_font)
        draw.text((x + 20, 110), c["d1"], fill=(161, 161, 170), font=desc_font)
        draw.text((x + 20, 126), c["d2"], fill=(161, 161, 170), font=desc_font)
        draw.text((x + 20, 142), c["d3"], fill=(161, 161, 170), font=desc_font)
        draw.text((x + 20, 172), c["code"], fill=c["color"], font=code_font)

    img.save(os.path.join(OUT, "features.png"), "PNG")
    print("features.png done")


def render_terminal():
    W, H = 820, 430
    img = Image.new("RGB", (W, H), "#111118")
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([0, 0, W - 1, H - 1], radius=12, outline=(42, 42, 58), width=1)
    draw.rectangle([0, 0, W, 38], fill=(22, 22, 30))
    draw.rounded_rectangle([0, 0, W - 1, 38], radius=12, fill=(22, 22, 30))
    draw.rectangle([0, 26, W, 38], fill=(22, 22, 30))
    draw.line([(0, 38), (W, 38)], fill=(42, 42, 58), width=1)

    draw.ellipse([14, 13, 26, 25], fill=(255, 95, 87))
    draw.ellipse([34, 13, 46, 25], fill=(254, 188, 46))
    draw.ellipse([54, 13, 66, 25], fill=(40, 200, 64))

    bar_font = get_font(11)
    draw.text((W // 2, 20), "vapor build --release --vibes", fill=(113, 113, 122), font=bar_font, anchor="mm")

    mono = get_font(13)
    mono_sm = get_font(12)
    green = (74, 222, 128)
    white = (212, 212, 216)
    gray = (113, 113, 122)
    cyan = (34, 211, 238)
    yellow = (251, 191, 36)

    y = 58
    lines = [
        [("   Compiling", green, True), (" examples/hello.vp (vaporlang 0.1.0)", white, False)],
        [],
        [("      Lexing", green, True), (" 24 lines of source", white, False)],
        [("             keywords: conviction, use, maybe, align!, Probably, fn, let, Vibes", gray, False)],
        [],
        [("    Aligning", green, True), (" alignment score: 8/10", white, False)],
        [("           ✓", green, False), (" alignment policy satisfied", white, False)],
        [],
        [("    Checking", green, True), (" 1 function, 0 structs", white, False)],
        [("           ✓", green, False), (" resolved 13 probabilistic types", white, False)],
        [("             note: Probably<T> types resolved with p=0.87", gray, False)],
        [],
        [("  Generating", green, True), (" hello.wasm (target: wasm32-unknown-vibes)", white, False)],
        [("    Emitting", cyan, False), (" [██████████████████████████████] 100%", white, False)],
        [],
        [("     Linking", green, True), (" std::maybe, std::conviction", white, False)],
        [],
        [("    Finished", green, True), (" hello.wasm", (244, 244, 245), True), (" (2,152 bytes)", white, False)],
        [("             compiled in 0.16s", gray, False)],
        [],
        [("  Protecting", cyan, False), (" applying training data exclusion fence", white, False)],
        [("           ✓", green, False), (" model training opt-out compiled into binary headers", white, False)],
    ]

    for line_parts in lines:
        if not line_parts:
            y += 8
            continue
        x = 24
        for text, color, bold in line_parts:
            f = mono if not bold else mono
            draw.text((x, y), text, fill=color, font=f)
            bbox = f.getbbox(text)
            x += bbox[2] - bbox[0]
        y += 18

    img.save(os.path.join(OUT, "terminal.png"), "PNG")
    print("terminal.png done")


def render_architecture():
    W, H = 700, 380
    img = Image.new("RGB", (W, H), "#0a0a0f")
    draw = ImageDraw.Draw(img)

    font = get_sans(13, bold=True)
    font_sm = get_sans(11)
    border = (50, 50, 70)
    accent = (34, 211, 238)
    purple = (167, 139, 250)
    green = (74, 222, 128)
    pink = (244, 114, 182)
    text_c = (228, 228, 231)
    muted = (161, 161, 170)

    pad = 30
    bw = W - 2 * pad
    rh = 50

    def draw_box(y, label, color, sublabel=None):
        draw.rounded_rectangle([pad, y, pad + bw, y + rh], radius=8, outline=color, width=1, fill=(color[0]//10, color[1]//10, color[2]//10))
        draw.text((W // 2, y + (rh // 2 if not sublabel else rh // 2 - 8)), label, fill=text_c, font=font, anchor="mm")
        if sublabel:
            draw.text((W // 2, y + rh // 2 + 10), sublabel, fill=muted, font=font_sm, anchor="mm")

    def draw_multi(y, items, color):
        n = len(items)
        iw = bw // n
        for i, (lab, sub) in enumerate(items):
            x1 = pad + i * iw
            x2 = x1 + iw - 4
            draw.rounded_rectangle([x1, y, x2, y + rh], radius=8, outline=color, width=1, fill=(color[0]//10, color[1]//10, color[2]//10))
            draw.text(((x1 + x2) // 2, y + (rh // 2 if not sub else rh // 2 - 8)), lab, fill=text_c, font=font, anchor="mm")
            if sub:
                draw.text(((x1 + x2) // 2, y + rh // 2 + 10), sub, fill=muted, font=font_sm, anchor="mm")

    def draw_arrow(y1, y2):
        cx = W // 2
        draw.line([(cx, y1), (cx, y2)], fill=border, width=1)
        draw.polygon([(cx - 4, y2 - 6), (cx + 4, y2 - 6), (cx, y2)], fill=border)

    y = 15
    draw_box(y, "vapor CLI", accent)

    draw_arrow(y + rh, y + rh + 15)
    y += rh + 15

    draw_multi(y, [("Lexer", None), ("Parser", None), ("Aligner", None), ("Moat Analyzer", None)], purple)

    draw_arrow(y + rh, y + rh + 15)
    y += rh + 15

    draw_box(y, "MIR (Mid-level IR)", pink, "mir::ops::Hope")

    draw_arrow(y + rh, y + rh + 15)
    y += rh + 15

    draw_box(y, "Code Generator", green, "→ wasm32-unknown-vibes")

    draw_arrow(y + rh, y + rh + 15)
    y += rh + 15

    draw_box(y, "VaporLang Runtime (VRT)", accent, "Consensus Engine")

    draw_arrow(y + rh, y + rh + 15)
    y += rh + 15

    draw_multi(y, [("Edge Deploy", None), ("Vibes Context", None), ("Alignment Verifier", None)], purple)

    img.save(os.path.join(OUT, "architecture.png"), "PNG")
    print("architecture.png done")


if __name__ == "__main__":
    render_banner()
    render_features()
    render_terminal()
    render_architecture()
    print("All images rendered!")
