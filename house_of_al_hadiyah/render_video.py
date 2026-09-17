import os
import sys
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import imageio_ffmpeg

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
FONTS_DIR = os.path.join(ASSETS_DIR, "fonts")
OUTPUT_VIDEO = os.path.join(BASE_DIR, "house_of_al_hadiyah_10s_cinematic.mp4")
AUDIO_FILE = os.path.join(ASSETS_DIR, "cinematic_audio.wav")

SHOT1_PATH = os.path.join(ASSETS_DIR, "shot1_macro_studio.jpg")
SHOT2_PATH = os.path.join(ASSETS_DIR, "shot2_craft_scroll.jpg")
SHOT3_PATH = os.path.join(ASSETS_DIR, "shot3_golden_hour.jpg")

# Video Settings
WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_FRAMES = 300  # 10.0 seconds

# Load Fonts
FONT_SERIF_LARGE = ImageFont.truetype(os.path.join(FONTS_DIR, "cormorant.ttf"), 76)
FONT_SERIF_TITLE = ImageFont.truetype(os.path.join(FONTS_DIR, "cormorant.ttf"), 68)
FONT_SERIF_SUB = ImageFont.truetype(os.path.join(FONTS_DIR, "cormorant.ttf"), 38)
FONT_TAG = ImageFont.truetype(os.path.join(FONTS_DIR, "montserrat.ttf"), 20)
FONT_SMALL = ImageFont.truetype(os.path.join(FONTS_DIR, "montserrat.ttf"), 15)
FONT_DOT = ImageFont.truetype(os.path.join(FONTS_DIR, "cormorant.ttf"), 36)

# Colors
COLOR_CREAM = (247, 244, 238)
COLOR_GOLD = (212, 175, 55)
COLOR_TERRACOTTA = (200, 109, 81)
COLOR_SAGE = (116, 139, 117)
COLOR_DARK_STUDIO = (24, 22, 20)

def smoothstep(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3.0 - 2.0 * x)

def cosine_ease(x):
    x = max(0.0, min(1.0, x))
    return (1.0 - math.cos(math.pi * x)) / 2.0

# Pre-load and upscale source images to high-res buffer
print("Loading source images...")
img1_raw = Image.open(SHOT1_PATH).convert("RGB")
img2_raw = Image.open(SHOT2_PATH).convert("RGB")
img3_raw = Image.open(SHOT3_PATH).convert("RGB")

# Target buffer size with margin for camera zoom/pan (2560x1440)
BUFFER_W, BUFFER_H = 2560, 1440
buf1 = img1_raw.resize((BUFFER_W, BUFFER_H), Image.Resampling.LANCZOS)
buf2 = img2_raw.resize((BUFFER_W, BUFFER_H), Image.Resampling.LANCZOS)
buf3 = img3_raw.resize((BUFFER_W, BUFFER_H), Image.Resampling.LANCZOS)

# Create Studio Vignette Overlay for Shot 1
vignette_mask = Image.new("L", (WIDTH, HEIGHT), 0)
vignette_draw = ImageDraw.Draw(vignette_mask)
for r in range(min(WIDTH, HEIGHT) // 2, int(math.hypot(WIDTH, HEIGHT) / 2) + 20, 4):
    norm = (r - (min(WIDTH, HEIGHT) // 2)) / (math.hypot(WIDTH, HEIGHT) / 2 - min(WIDTH, HEIGHT) // 2)
    alpha = int(255 * (norm ** 1.6) * 0.75)
    vignette_draw.ellipse(
        (WIDTH // 2 - r, HEIGHT // 2 - r, WIDTH // 2 + r, HEIGHT // 2 + r),
        outline=min(255, alpha),
        width=4
    )
vignette_mask = vignette_mask.filter(ImageFilter.GaussianBlur(30))
vignette_dark = Image.new("RGBA", (WIDTH, HEIGHT), (16, 14, 13, 255))

def sample_frame(buf, scale, center_x, center_y):
    """Samples a 1920x1080 crop from high-res buffer with scale and center offsets."""
    crop_w = BUFFER_W / scale
    crop_h = BUFFER_H / scale
    
    # Calculate crop box in buffer coordinates
    cx = BUFFER_W * center_x
    cy = BUFFER_H * center_y
    
    left = max(0, min(BUFFER_W - crop_w, cx - crop_w / 2.0))
    top = max(0, min(BUFFER_H - crop_h, cy - crop_h / 2.0))
    right = left + crop_w
    bottom = top + crop_h
    
    crop = buf.crop((int(left), int(top), int(right), int(bottom)))
    return crop.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

def draw_pill_badge(draw, x, y, width, height, radius, bg_color, border_color, border_width=1):
    """Draws a refined frosted glass pill badge."""
    draw.rounded_rectangle(
        [x, y, x + width, y + height],
        radius=radius,
        fill=bg_color,
        outline=border_color,
        width=border_width
    )

def render_shot1_frame(frame_idx):
    progress = frame_idx / 110.0
    s_curve = smoothstep(progress)
    scale = 1.00 + 0.14 * s_curve
    
    cx = 0.50 - 0.02 * s_curve
    cy = 0.52 - 0.02 * s_curve
    
    base = sample_frame(buf1, scale, cx, cy).convert("RGBA")
    base.paste(vignette_dark, (0, 0), vignette_mask)
    
    # Text Overlay: "WORN. NOT MADE."
    text_alpha = 0.0
    if 15 <= frame_idx < 35:
        text_alpha = smoothstep((frame_idx - 15) / 20.0)
    elif 35 <= frame_idx <= 80:
        text_alpha = 1.0
    elif 80 < frame_idx <= 100:
        text_alpha = 1.0 - smoothstep((frame_idx - 80) / 20.0)
        
    if text_alpha > 0.001:
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        scrim_y1 = int(HEIGHT * 0.65)
        scrim_y2 = int(HEIGHT * 0.95)
        for y in range(scrim_y1, scrim_y2):
            s_prog = (y - scrim_y1) / (scrim_y2 - scrim_y1)
            scrim_a = int(140 * math.sin(s_prog * math.pi) * text_alpha)
            draw.line([(WIDTH * 0.1, y), (WIDTH * 0.9, y)], fill=(18, 16, 15, scrim_a))
        
        ty_offset = int((1.0 - text_alpha) * 12)
        
        kicker_text = "H O U S E   O F   A L   H A D I Y A H"
        k_bbox = draw.textbbox((0, 0), kicker_text, font=FONT_SMALL)
        kw = k_bbox[2] - k_bbox[0]
        kx = (WIDTH - kw) / 2
        ky = int(HEIGHT * 0.73) + ty_offset
        draw.text((kx, ky), kicker_text, font=FONT_SMALL, fill=(212, 175, 55, int(220 * text_alpha)))
        
        main_text = "W O R N .   N O T   M A D E ."
        m_bbox = draw.textbbox((0, 0), main_text, font=FONT_SERIF_LARGE)
        mw = m_bbox[2] - m_bbox[0]
        mx = (WIDTH - mw) / 2
        my = int(HEIGHT * 0.77) + ty_offset
        
        draw.text((mx + 2, my + 2), main_text, font=FONT_SERIF_LARGE, fill=(10, 8, 7, int(200 * text_alpha)))
        draw.text((mx, my), main_text, font=FONT_SERIF_LARGE, fill=(247, 244, 238, int(255 * text_alpha)))
        
        line_w = int(120 * text_alpha)
        line_y = my + (m_bbox[3] - m_bbox[1]) + 16
        draw.line(
            [(WIDTH // 2 - line_w // 2, line_y), (WIDTH // 2 + line_w // 2, line_y)],
            fill=(212, 175, 55, int(200 * text_alpha)),
            width=2
        )
        
        base = Image.alpha_composite(base, overlay)
        
    return base

def render_shot2_frame(frame_idx):
    rel_idx = frame_idx - 95
    total_shot_len = 125.0
    progress = max(0.0, min(1.0, rel_idx / total_shot_len))
    s_curve = smoothstep(progress)
    
    cx = 0.44 + 0.12 * s_curve
    cy = 0.50 + 0.03 * math.sin(progress * math.pi)
    scale = 1.03 + 0.08 * s_curve
    
    base = sample_frame(buf2, scale, cx, cy).convert("RGBA")
    grade = Image.new("RGBA", (WIDTH, HEIGHT), (35, 25, 18, 25))
    base = Image.alpha_composite(base, grade)
    
    tags_data = [
        ("HANDCRAFTED", 112, 134),
        ("NATURAL STONES", 138, 160),
        ("ADJUSTABLE FIT", 164, 186),
    ]
    
    master_exit = 1.0
    if frame_idx > 204:
        master_exit = 1.0 - smoothstep((frame_idx - 204) / 12.0)
        
    if frame_idx >= 112 and master_exit > 0.001:
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        tag_items = []
        for text, f_in_start, f_in_end in tags_data:
            bbox = draw.textbbox((0, 0), text, font=FONT_TAG)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            pad_x, pad_y = 28, 14
            bw = tw + pad_x * 2
            bh = th + pad_y * 2
            
            if frame_idx < f_in_start:
                alpha = 0.0
            elif frame_idx < f_in_end:
                alpha = smoothstep((frame_idx - f_in_start) / (f_in_end - f_in_start))
            else:
                alpha = 1.0
            alpha *= master_exit
            
            tag_items.append({
                "text": text,
                "tw": tw, "th": th,
                "bw": bw, "bh": bh,
                "alpha": alpha,
                "slide_offset": int((1.0 - alpha) * 18)
            })
            
        dot_bbox = draw.textbbox((0, 0), "·", font=FONT_DOT)
        dot_w = dot_bbox[2] - dot_bbox[0]
        dot_gap = 22
        
        total_row_w = (
            tag_items[0]["bw"] + dot_gap + dot_w + dot_gap +
            tag_items[1]["bw"] + dot_gap + dot_w + dot_gap +
            tag_items[2]["bw"]
        )
        
        start_x = (WIDTH - total_row_w) / 2
        base_y = int(HEIGHT * 0.80)
        
        curr_x = start_x
        for i, item in enumerate(tag_items):
            a = item["alpha"]
            if a > 0.001:
                bx = int(curr_x)
                by = int(base_y + item["slide_offset"])
                
                draw_pill_badge(
                    draw, bx, by, item["bw"], item["bh"],
                    radius=24,
                    bg_color=(20, 18, 17, int(205 * a)),
                    border_color=(212, 175, 55, int(150 * a)),
                    border_width=1
                )
                
                draw_pill_badge(
                    draw, bx + 1, by + 1, item["bw"] - 2, item["bh"] - 2,
                    radius=23,
                    bg_color=(0, 0, 0, 0),
                    border_color=(247, 244, 238, int(35 * a)),
                    border_width=1
                )
                
                tx = bx + (item["bw"] - item["tw"]) / 2
                ty = by + (item["bh"] - item["th"]) / 2 - 2
                draw.text((tx, ty), item["text"], font=FONT_TAG, fill=(247, 244, 238, int(245 * a)))
                
            curr_x += item["bw"] + dot_gap
            
            if i < 2:
                next_item = tag_items[i + 1]
                dot_a = min(item["alpha"], next_item["alpha"])
                if dot_a > 0.001:
                    dx = curr_x
                    dy = base_y + 4
                    draw.text((dx, dy), "·", font=FONT_DOT, fill=(212, 175, 55, int(220 * dot_a)))
                curr_x += dot_w + dot_gap
                
        base = Image.alpha_composite(base, overlay)
        
    return base

def render_shot3_frame(frame_idx):
    rel_idx = frame_idx - 205
    total_shot_len = 95.0
    progress = max(0.0, min(1.0, rel_idx / total_shot_len))
    s_curve = smoothstep(progress)
    
    cx = 0.50 + 0.04 * s_curve
    cy = 0.50 - 0.03 * s_curve
    scale = 1.00 + 0.08 * s_curve
    
    base = sample_frame(buf3, scale, cx, cy).convert("RGBA")
    warmth = Image.new("RGBA", (WIDTH, HEIGHT), (255, 180, 80, int(18 + 10 * math.sin(progress * math.pi))))
    base = Image.alpha_composite(base, warmth)
    
    outro_alpha = 0.0
    if 224 <= frame_idx < 248:
        outro_alpha = smoothstep((frame_idx - 224) / 24.0)
    elif 248 <= frame_idx <= 286:
        outro_alpha = 1.0
    elif 286 < frame_idx <= 299:
        outro_alpha = 1.0 - smoothstep((frame_idx - 286) / 13.0)
        
    if outro_alpha > 0.001:
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        scrim_y1 = int(HEIGHT * 0.62)
        scrim_y2 = int(HEIGHT * 0.98)
        for y in range(scrim_y1, scrim_y2):
            s_prog = (y - scrim_y1) / (scrim_y2 - scrim_y1)
            scrim_a = int(150 * math.sin(s_prog * math.pi) * outro_alpha)
            draw.line([(WIDTH * 0.12, y), (WIDTH * 0.88, y)], fill=(18, 14, 12, scrim_a))
            
        ty_offset = int((1.0 - outro_alpha) * 10)
        
        brand_text = "HOUSE OF AL HADIYAH"
        b_bbox = draw.textbbox((0, 0), brand_text, font=FONT_SERIF_TITLE)
        bw = b_bbox[2] - b_bbox[0]
        bx = (WIDTH - bw) / 2
        by = int(HEIGHT * 0.72) + ty_offset
        
        draw.text((bx + 2, by + 2), brand_text, font=FONT_SERIF_TITLE, fill=(12, 10, 9, int(210 * outro_alpha)))
        draw.text((bx, by), brand_text, font=FONT_SERIF_TITLE, fill=(247, 244, 238, int(255 * outro_alpha)))
        
        sub_text = "H A N D M A D E   N A T U R A L   S T O N E   B R A C E L E T S"
        s_bbox = draw.textbbox((0, 0), sub_text, font=FONT_SMALL)
        sw = s_bbox[2] - s_bbox[0]
        sx = (WIDTH - sw) / 2
        sy = by + (b_bbox[3] - b_bbox[1]) + 14
        draw.text((sx, sy), sub_text, font=FONT_SMALL, fill=(212, 175, 55, int(230 * outro_alpha)))
        
        tag_text = "W O R N .   N O T   M A D E ."
        t_bbox = draw.textbbox((0, 0), tag_text, font=FONT_SERIF_SUB)
        tw = t_bbox[2] - t_bbox[0]
        tx = (WIDTH - tw) / 2
        ty = sy + (s_bbox[3] - s_bbox[1]) + 16
        draw.text((tx, ty), tag_text, font=FONT_SERIF_SUB, fill=(247, 244, 238, int(210 * outro_alpha)))
        
        base = Image.alpha_composite(base, overlay)
        
    if frame_idx >= 292:
        fade_black = smoothstep((frame_idx - 292) / 8.0)
        black_layer = Image.new("RGBA", (WIDTH, HEIGHT), (18, 16, 15, int(220 * fade_black)))
        base = Image.alpha_composite(base, black_layer)
        
    return base

def get_frame(frame_idx):
    if frame_idx < 95:
        return render_shot1_frame(frame_idx).convert("RGB")
    elif 95 <= frame_idx < 110:
        f1 = render_shot1_frame(frame_idx).convert("RGB")
        f2 = render_shot2_frame(frame_idx).convert("RGB")
        alpha = cosine_ease((frame_idx - 95) / 15.0)
        return Image.blend(f1, f2, alpha)
    elif 110 <= frame_idx < 205:
        return render_shot2_frame(frame_idx).convert("RGB")
    elif 205 <= frame_idx < 220:
        f2 = render_shot2_frame(frame_idx).convert("RGB")
        f3 = render_shot3_frame(frame_idx).convert("RGB")
        alpha = cosine_ease((frame_idx - 205) / 15.0)
        return Image.blend(f2, f3, alpha)
    else:
        return render_shot3_frame(frame_idx).convert("RGB")

def main():
    print(f"Starting 10-second cinematic video render ({TOTAL_FRAMES} frames @ {FPS} fps, 1920x1080)...")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", AUDIO_FILE,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        OUTPUT_VIDEO
    ]
    
    process = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    
    for idx in range(TOTAL_FRAMES):
        frame = get_frame(idx)
        process.stdin.write(frame.tobytes())
        if (idx + 1) % 30 == 0 or idx == TOTAL_FRAMES - 1:
            sec = (idx + 1) / FPS
            print(f"Rendered frame {idx + 1}/{TOTAL_FRAMES} ({sec:.1f}s / 10.0s)")
            
    process.stdin.close()
    process.wait()
    
    if process.returncode == 0:
        file_size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
        print(f"\nSUCCESS! Video saved to: {OUTPUT_VIDEO}")
        print(f"File size: {file_size_mb:.2f} MB")
    else:
        print("FFmpeg encoding failed with code:", process.returncode)
        sys.exit(1)

if __name__ == "__main__":
    main()
