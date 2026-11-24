#!/usr/bin/env python3
"""og-card.png (1200x630) 생성 — 카톡 공유 카드용, 글씨 안전영역(56px 이상) 준수."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
FP = "fonts/Pretendard-%s.ttf"


def font(weight, size):
    return ImageFont.truetype(FP % weight, size)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def layer():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


# ---------- 배경 그라데이션 ----------
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)
c1, c2 = (10, 132, 121), (28, 196, 172)
for y in range(H):
    d.line([(0, y), (W, y)], fill=lerp(c1, c2, y / (H - 1)))
img = img.convert("RGBA")

# ---------- 장식 (별도 레이어 → 합성) ----------
deco = layer()
dd = ImageDraw.Draw(deco)
dd.polygon([(0, 0), (int(W * 0.56), 0), (0, int(H * 0.9))], fill=(255, 255, 255, 16))
dd.ellipse([W - 320, -260, W + 200, 260], fill=(255, 255, 255, 24))
dd.ellipse([-180, H - 240, 240, H + 180], fill=(255, 255, 255, 14))


def paw(dr, cx, cy, s, color):
    for tx, ty, r in [(-0.60, -0.42, 0.185), (-0.21, -0.68, 0.195),
                      (0.21, -0.68, 0.195), (0.60, -0.42, 0.185)]:
        dr.ellipse([cx + tx * s - r * s, cy + ty * s - r * s * 1.18,
                    cx + tx * s + r * s, cy + ty * s + r * s * 1.18], fill=color)
    dr.ellipse([cx - 0.44 * s, cy - 0.12 * s, cx + 0.44 * s, cy + 0.58 * s], fill=color)


paw(dd, 690, 96, 30, (255, 255, 255, 46))
paw(dd, 648, 142, 19, (255, 255, 255, 30))
img = Image.alpha_composite(img, deco)

L = 72  # 안전영역

# ---------- 상단 라벨 ----------
label = "굿모닝펫동물병원 · 실전 노하우"
lf = font("SemiBold", 23)
lw = d.textbbox((0, 0), label, font=lf)[2]
lx, ly, lh = L, 76, 46

# ---------- 제목 좌표 ----------
y1 = 152
y2 = y1 + 73
chips = ["① 자료 준비", "② 지시문 복사", "③ 카톡에 붙여넣기"]
chipf = font("Bold", 22)
chip_w = [d.textbbox((0, 0), c, font=chipf)[2] + 40 for c in chips]
cy = y2 + 156

# ---------- 반투명 판(라벨·칩) 레이어 ----------
pane = layer()
pd = ImageDraw.Draw(pane)
pd.rounded_rectangle([lx, ly, lx + lw + 44, ly + lh], radius=lh // 2,
                     fill=(255, 255, 255, 38), outline=(255, 255, 255, 92), width=2)
cx = L
for cw in chip_w:
    pd.rounded_rectangle([cx, cy, cx + cw, cy + 48], radius=24,
                         fill=(255, 255, 255, 46), outline=(255, 255, 255, 80), width=2)
    cx += cw + 11
img = Image.alpha_composite(img, pane)

# ---------- 오른쪽 채팅 카드 ----------
card = [744, 126, 1140, 500]
shadow = layer()
ImageDraw.Draw(shadow).rounded_rectangle([card[0] + 2, card[1] + 12, card[2] + 2, card[3] + 12],
                                         radius=30, fill=(6, 62, 56, 60))
img = Image.alpha_composite(img, shadow)

dr = ImageDraw.Draw(img)
dr.rounded_rectangle(card, radius=30, fill=(255, 255, 255))
for i, col in enumerate([(255, 118, 108), (255, 199, 88), (108, 208, 148)]):
    dr.ellipse([card[0] + 26 + i * 21, card[1] + 23, card[0] + 39 + i * 21, card[1] + 36], fill=col)

bub = [card[0] + 24, card[1] + 56, card[2] - 24, card[3] - 74]
dr.rounded_rectangle(bub, radius=22, fill=(254, 246, 198))
dr.polygon([(bub[0], bub[1] + 22), (bub[0] - 11, bub[1] + 34), (bub[0], bub[1] + 44)],
           fill=(254, 246, 198))

bars = [(0.66, (146, 156, 154)), (0.84, (146, 156, 154)), None,
        (0.74, (166, 175, 173)), (0.58, (166, 175, 173)), None,
        (0.80, (166, 175, 173)), (0.46, (166, 175, 173))]
bx0, bx1 = bub[0] + 22, bub[2] - 22
by = bub[1] + 24
for item in bars:
    if item is None:
        by += 14
        continue
    ratio, col = item
    dr.rounded_rectangle([bx0, by, bx0 + (bx1 - bx0) * ratio, by + 13], radius=6, fill=col)
    by += 23
dr.rounded_rectangle([bx0, by + 6, bx0 + 120, by + 23], radius=5, fill=(148, 194, 226))

badgef = font("Bold", 20)
bt = "400자 이내"
bw2 = d.textbbox((0, 0), bt, font=badgef)[2]
dr.rounded_rectangle([card[2] - bw2 - 44, card[3] - 58, card[2] - 16, card[3] - 18],
                     radius=21, fill=(15, 157, 143))
dr.text((card[2] - bw2 - 30, card[3] - 51), bt, font=badgef, fill=(255, 255, 255))

# ---------- 텍스트 ----------
dr.text((lx + 22, ly + 8), label, font=lf, fill=(255, 255, 255))

t1f = font("ExtraBold", 57)
t2f = font("ExtraBold", 57)
dr.text((L, y1), "동물병원 보호자", font=t1f, fill=(255, 255, 255))
dr.text((L, y2), "카톡 안내 · 1분 작성 가이드", font=t2f, fill=(255, 228, 120))

sf = font("Medium", 27)
dr.text((L, y2 + 98), "펫메이트 엑셀 + 원장님 코멘트만 있으면 끝", font=sf, fill=(234, 255, 250))

cx = L
for c, cw in zip(chips, chip_w):
    dr.text((cx + 20, cy + 9), c, font=chipf, fill=(255, 255, 255))
    cx += cw + 11

ff = font("SemiBold", 21)
dr.text((L, H - 72), "m.pet-mate.net/my-cardnews  ·  400자 이내  ·  복붙 1분",
        font=ff, fill=(214, 246, 240))

img.convert("RGB").save("work_petmate_guide/og-card.png", "PNG", optimize=True)
print("saved 1200x630")
