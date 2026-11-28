#!/usr/bin/env python3
"""og-gvn.png (1200x630) 생성 — GVN 진료 신청·병원 안내 카톡 공유 카드.
히어로 사진(assets/gvn-hero.jpg) 위에 스크림 + 명조 타이틀. 글씨 안전영역(72px) 준수."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
SERIF = "/usr/share/fonts/pickle-hwp/NotoSerifCJKkr-Regular.otf"
SANS = "../fonts/Pretendard-%s.ttf"


def sans(weight, size):
    return ImageFont.truetype(SANS % weight, size)


# 배경: 히어로 사진을 1200x630으로 채움
bg = Image.open("assets/gvn-hero.jpg").convert("RGB")
sw, sh = bg.size
scale = max(W / sw, H / sh)
bg = bg.resize((round(sw * scale) + 1, round(sh * scale) + 1), Image.LANCZOS)
left = (bg.width - W) // 2
bg = bg.crop((left, 0, left + W, H))
bg = bg.filter(ImageFilter.GaussianBlur(0.6)).convert("RGBA")

# 전체를 살짝 가라앉힌 뒤 좌→우, 하→상 스크림 (픽셀별 알파를 numpy로 한 번에 계산)
import numpy as np

xs = np.arange(W)[None, :]
ys = np.arange(H)[:, None]
a_h = 150.0 * np.clip(1 - xs / (W * 1.05), 0, 1) ** 0.8
v = np.clip((ys - H * 0.35) / (H * 0.65), 0, 1)
a_v = 118.0 * v ** 1.15
alpha = np.clip(96 + np.maximum(a_h, a_v), 0, 255).astype("uint8")
scrim = np.zeros((H, W, 4), dtype="uint8")
scrim[:, :, 0] = 9
scrim[:, :, 1] = 20
scrim[:, :, 2] = 16
scrim[:, :, 3] = alpha
img = Image.alpha_composite(bg, Image.fromarray(scrim, "RGBA"))
d = ImageDraw.Draw(img)

L = 78
GOLD = (233, 205, 141)
CREAM = (247, 243, 233)

# 상단 라벨
label = "SINCE 2003  ·  분당 굿모닝펫동물병원"
lf = sans("SemiBold", 22)
lw = d.textbbox((0, 0), label, font=lf)[2]
d.rounded_rectangle([L, 68, L + lw + 40, 68 + 44], radius=22,
                    fill=(9, 20, 16, 120), outline=(233, 205, 141, 170), width=1)
d.text((L + 20, 77), label, font=lf, fill=CREAM)

# 타이틀 (명조)
t1 = ImageFont.truetype(SERIF, 54)
t2 = ImageFont.truetype(SERIF, 76)
d.text((L, 168), "강아지도, 고양이도 스무 살까지", font=t1, fill=CREAM)
d.text((L, 250), "진료 신청 · 병원 안내", font=t2, fill=GOLD)

# 구분선
d.line([(L + 2, 366), (L + 132, 366)], fill=(233, 205, 141, 190), width=3)

# 서브
sf = sans("Medium", 27)
d.text((L, 396), "2003 → 2026 · 23년차  |  수술 21,425건 · 건강검진 19,617건", font=sf, fill=CREAM)
sf2 = sans("SemiBold", 24)
d.text((L, 448), "진료 시간 · 병원 소개 영상 · 오시는 길 · 지방에서 오는 방법", font=sf2, fill=(236, 243, 246))

# 하단 브랜드
d.text((L, H - 96), "경기 성남시 분당구 정자일로 55  ·  카톡 GoodPet  ·  031-715-7119",
       font=sans("Medium", 21), fill=(226, 235, 240))

img.convert("RGB").save("assets/og-gvn.png", optimize=True)
print("saved assets/og-gvn.png")
