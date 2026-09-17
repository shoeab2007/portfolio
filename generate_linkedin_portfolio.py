"""
Shoeab Ahmed // LinkedIn Portfolio PDF Presentation Generator
Generates a 12-slide, 16:9 widescreen, high-impact editorial PDF portfolio deck
optimized for LinkedIn Document uploads (carousels & profile featured media).
Updated with refined typography: Hanken Grotesk & Space Grotesk (eliminating wide-stretched Syne).
"""

import os
import sys
import base64
import subprocess
import pymupdf
import shutil

WORKSPACE_DIR = r'c:\Users\Shoeab\Downloads\Portfolio_Assets'
OUTPUT_PDF = os.path.join(WORKSPACE_DIR, 'Shoeab_Ahmed_LinkedIn_Portfolio.pdf')
PREVIEWS_DIR = os.path.join(WORKSPACE_DIR, 'portfolio_pdf_previews')
HTML_FILE = os.path.join(WORKSPACE_DIR, 'scratch', 'linkedin_deck.html')
CHROME_PATH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

def get_base64_file(rel_path):
    abs_path = os.path.join(WORKSPACE_DIR, rel_path)
    if not os.path.exists(abs_path):
        print(f"Warning: File not found: {abs_path}")
        return ""
    with open(abs_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def get_base64_image(rel_path):
    abs_path = os.path.join(WORKSPACE_DIR, rel_path)
    if not os.path.exists(abs_path):
        print(f"Warning: Image not found: {abs_path}")
        return ""
    
    ext = os.path.splitext(rel_path)[1].lower()
    mime = "image/webp"
    if ext in ['.jpg', '.jpeg']:
        mime = "image/jpeg"
    elif ext == '.png':
        mime = "image/png"
    
    with open(abs_path, 'rb') as f:
        data = base64.b64encode(f.read()).decode('utf-8')
    return f"data:{mime};base64,{data}"

def build_html():
    print("Encoding fonts and project assets to base64...")
    # Fonts
    b64_tight = get_base64_file('scratch/fonts/InterTight-Variable.ttf')
    b64_mono_reg = get_base64_file('scratch/fonts/SpaceMono-Regular.ttf')
    b64_mono_bold = get_base64_file('scratch/fonts/SpaceMono-Bold.ttf')

    # Gig Posters
    img_zynth = get_base64_image('01_Gig_Posters/2026_May_AntiSOCIAL_Zynth Main_Post.webp')
    img_pullup = get_base64_image('01_Gig_Posters/2026_April_KharSOCIAL_PullUP_Post.webp')
    img_xchange = get_base64_image('01_Gig_Posters/2026_April_Social Xchange_Post.webp')
    img_heads = get_base64_image('01_Gig_Posters/2026_May_AntiSOCIAL_Heads will Roll_Post.webp')
    img_desi = get_base64_image('01_Gig_Posters/2026_May_Chembur_Desi Class_Post.webp')
    img_house52 = get_base64_image('01_Gig_Posters/2026_May_Khar social_House52_Post.webp')

    # Campaigns
    img_coeus_final = get_base64_image('02_Campaign_and_Promos/COEUS/COEUS Finasl.webp')
    img_coeus_banner = get_base64_image('02_Campaign_and_Promos/COEUS/COEUS 1280x640.webp')
    img_coeus_story = get_base64_image('02_Campaign_and_Promos/COEUS/COEUS Story.webp')
    img_coeus_portal = get_base64_image('02_Campaign_and_Promos/COEUS/COEUS 500x750.webp')

    img_molo_banner = get_base64_image('02_Campaign_and_Promos/MOLO/Molo 5th April Cover Skillbox 1350x1080.webp')
    img_molo_insider = get_base64_image('02_Campaign_and_Promos/MOLO/Molo 5th April Cover Insider.webp')

    img_dop_cal = get_base64_image('02_Campaign_and_Promos/2025_April_DOP/DOP April Calender.webp')
    img_dop_week2_post = get_base64_image('02_Campaign_and_Promos/2025_April_DOP/DOP Week 2.webp')
    img_dop_week1_story = get_base64_image('02_Campaign_and_Promos/2025_April_DOP/DOP Week 1 Story.webp')
    img_dop_feb_post = get_base64_image('02_Campaign_and_Promos/2025_Feb_DOP/DOP13th Feb Post.webp')

    # Calendars
    img_cal_anti_sunboard = get_base64_image('02_Event_Calendars/Anti_Calendar_June/Anti Calender June Sunboard.webp')
    img_cal_anti_story = get_base64_image('02_Event_Calendars/Anti_Calendar_June/Anti Calender June story.webp')
    img_cal_khar_sunboard = get_base64_image('02_Event_Calendars/Khar_Calendar_May/khar Calender WEEKS Sunboard.webp')

    # Brochures & Corporate Profile
    img_brochure_cover = get_base64_image('04_Brochures/F.Gheewala_Cover.webp')
    img_brochure_page = get_base64_image('scratch/brochure_page_1.png')

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @page {{
    size: 1920px 1080px;
    margin: 0;
  }}
  @font-face {{
    font-family: 'Inter Tight';
    src: url('data:font/truetype;charset=utf-8;base64,{b64_tight}') format('truetype');
    font-weight: 100 900;
    font-style: normal;
  }}
  @font-face {{
    font-family: 'Space Mono';
    src: url('data:font/truetype;charset=utf-8;base64,{b64_mono_reg}') format('truetype');
    font-weight: 400;
    font-style: normal;
  }}
  @font-face {{
    font-family: 'Space Mono';
    src: url('data:font/truetype;charset=utf-8;base64,{b64_mono_bold}') format('truetype');
    font-weight: 700;
    font-style: normal;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}
  body {{
    background-color: #000000;
    color: #FFFFFF;
    font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    letter-spacing: -0.01em;
  }}
  
  .slide {{
    width: 1920px;
    height: 1080px;
    position: relative;
    overflow: hidden;
    background-color: #000000;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: 60px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px 60px 32px 60px;
    page-break-after: always;
    break-after: page;
  }}

  /* Top Bar */
  .slide-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    padding-bottom: 16px;
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 0.04em;
    z-index: 10;
  }}
  .slide-header .brand {{
    display: flex;
    align-items: center;
    gap: 10px;
    color: #FFFFFF;
    font-weight: 700;
  }}
  .slide-header .pulse-dot {{
    width: 8px;
    height: 8px;
    background-color: #00FF66;
    border-radius: 50%;
    box-shadow: 0 0 10px #00FF66;
  }}
  .slide-header .category {{
    color: #00FF66;
    font-weight: 700;
  }}
  .slide-header .page-num {{
    color: rgba(255, 255, 255, 0.5);
    background: #0d0d0d;
    padding: 4px 12px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }}

  /* Bottom Bar */
  .slide-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding-top: 14px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.02em;
    text-transform: uppercase;
    z-index: 10;
  }}
  .slide-footer a {{
    color: #00FF66;
    text-decoration: none;
    transition: color 0.2s;
  }}
  .slide-footer a:hover {{
    color: #FFFFFF;
  }}

  /* Ambient Glows */
  .glow-green {{
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(0, 255, 102, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }}
  .glow-cyan {{
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(0, 240, 255, 0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }}

  /* Refined Typography (Compact, Upright, Modern Editorial) */
  h1, h2, h3, h4 {{
    font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.035em;
    line-height: 0.98;
  }}
  .text-accent {{ color: #00FF66; }}
  .text-cyan {{ color: #00F0FF; }}
  .text-white {{ color: #FFFFFF; }}
  .text-muted {{ color: rgba(255, 255, 255, 0.65); }}
  .mono {{ font-family: 'Space Mono', monospace; }}
  .heading-font {{ font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 800; letter-spacing: -0.015em; }}

  /* Cards & Boxes */
  .card {{
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    padding: 22px;
    position: relative;
    z-index: 5;
  }}
  .card-featured {{
    background: linear-gradient(135deg, rgba(0, 255, 102, 0.05) 0%, #0d0d0d 100%);
    border: 1px solid rgba(0, 255, 102, 0.4);
    box-shadow: 0 0 25px rgba(0, 255, 102, 0.08);
  }}
  .card-enterprise {{
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, #0d0d0d 100%);
    border: 1px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 25px rgba(59, 130, 246, 0.1);
  }}

  /* Pill Badges */
  .badge {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }}
  .badge-accent {{
    background: rgba(0, 255, 102, 0.12);
    border: 1px solid rgba(0, 255, 102, 0.4);
    color: #00FF66;
  }}
  .badge-cyan {{
    background: rgba(0, 240, 255, 0.12);
    border: 1px solid rgba(0, 240, 255, 0.4);
    color: #00F0FF;
  }}
  .badge-white {{
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #FFFFFF;
  }}
  .badge-blue {{
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.45);
    color: #60a5fa;
  }}

  /* Artwork Exhibit Frame */
  .art-frame {{
    background: #050505;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7);
  }}
  .art-frame .img-container {{
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #040404;
    overflow: hidden;
  }}
  .art-frame img {{
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
  }}
  .art-caption {{
    flex-shrink: 0;
    width: 100%;
    padding: 8px 14px;
    background: #0d0d0d;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(255, 255, 255, 0.85);
  }}

  /* Grid Layouts */
  .grid-3col {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    align-items: stretch;
  }}
  .grid-4col {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    align-items: stretch;
  }}
</style>
</head>
<body>

<!-- =============================================================
     SLIDE 1: COVER SLIDE
     ============================================================= -->
<div class="slide">
  <div class="glow-green" style="top: -100px; left: -100px;"></div>
  <div class="glow-cyan" style="bottom: -150px; right: -150px;"></div>

  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">CREATIVE DIRECTION &amp; VISUAL STRATEGY</div>
    <div class="page-num">01 // 12</div>
  </div>

  <div style="display: grid; grid-template-columns: 7fr 5fr; gap: 48px; align-items: center; margin: auto 0; z-index: 5;">
    <div>
      <div style="display: flex; gap: 10px; margin-bottom: 24px;">
        <span class="badge badge-accent">OPEN FOR COMMISSIONS</span>
        <span class="badge badge-white">9+ YEARS EXPERIENCE</span>
        <span class="badge badge-cyan">MUMBAI, INDIA • GLOBAL REMOTE</span>
      </div>

      <h1 style="font-size: 88px; line-height: 0.95; margin-bottom: 20px; letter-spacing: -0.04em;">
        SHOEAB<br>
        <span class="text-accent">AHMED</span>
      </h1>

      <div class="heading-font" style="font-size: 24px; color: #FFFFFF; margin-bottom: 24px; letter-spacing: -0.01em;">
        GRAPHIC DESIGNER &amp; VISUAL STRATEGIST
      </div>

      <p class="mono text-muted" style="font-size: 14px; line-height: 1.7; border-left: 3px solid #00FF66; padding-left: 20px; margin-bottom: 32px; max-width: 880px;">
        Specializing in brand identity, high-energy event visuals, 360° social media campaigns, and enterprise artwork compliance. Turning marketing objectives into sharp visuals that ship on time across commercial campaigns, live music festivals, and global brands.
      </p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 820px;">
        <div class="card" style="padding: 16px;">
          <div class="mono text-accent" style="font-size: 28px; font-weight: 900;">9+ YRS</div>
          <div class="mono text-muted" style="font-size: 10px; text-transform: uppercase; margin-top: 4px;">Industry Experience</div>
        </div>
        <div class="card" style="padding: 16px;">
          <div class="mono text-cyan" style="font-size: 28px; font-weight: 900;">500+</div>
          <div class="mono text-muted" style="font-size: 10px; text-transform: uppercase; margin-top: 4px;">Commercial Assets</div>
        </div>
        <div class="card" style="padding: 16px;">
          <div class="mono text-white" style="font-size: 28px; font-weight: 900;">UNILEVER</div>
          <div class="mono text-muted" style="font-size: 10px; text-transform: uppercase; margin-top: 4px;">Enterprise FMCG Credential</div>
        </div>
      </div>
    </div>

    <!-- Right Side Visual Collage Preview -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; transform: rotate(-1.5deg);">
      <div class="art-frame" style="height: 440px;">
        <div class="img-container">
          <img src="{img_zynth}" alt="Zynth Main Gig Poster">
        </div>
        <div class="art-caption">
          <span style="font-weight:700;">AntiSOCIAL // Zynth</span>
          <span style="color:#00FF66;">GIG POSTER</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="art-frame" style="height: 240px;">
          <div class="img-container">
            <img src="{img_pullup}" alt="KharSOCIAL PullUP">
          </div>
          <div class="art-caption">
            <span style="font-weight:700;">KharSOCIAL // PullUP</span>
            <span style="color:#00F0FF;">EVENT POST</span>
          </div>
        </div>
        <div class="card card-featured" style="padding: 18px; display: flex; flex-direction: column; justify-content: center;">
          <div class="mono text-accent" style="font-size: 11px; font-weight: 700; margin-bottom: 6px;">// PORTFOLIO PORTAL</div>
          <div class="heading-font" style="font-size: 16px;">EXPLORE LIVE SITE</div>
          <div class="mono text-muted" style="font-size: 11px; margin-top: 6px;">shoeab2007.github.io/portfolio</div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>SHOEAB AHMED • MUMBAI, INDIA • <a href="mailto:shoeab2007@gmail.com">shoeab2007@gmail.com</a></div>
    <div>LIVE ARCHIVE: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 2: GIG POSTERS & NIGHTLIFE VISUALS (VOL. 1)
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 02 • GIG POSTERS &amp; NIGHTLIFE VISUALS (VOL. 1)</div>
    <div class="page-num">02 // 12</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px; margin: auto 0; z-index: 5;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <span class="badge badge-accent" style="margin-bottom: 6px;">SELECTED WORKS: EVENT COLLATERAL</span>
        <h2 style="font-size: 38px; letter-spacing: -0.03em;">NIGHTLIFE &amp; MUSIC GIG POSTERS</h2>
      </div>
      <div class="mono text-muted" style="font-size: 12px; text-align: right;">
        CLIENTS: <span class="text-white">AntiSOCIAL • KharSOCIAL • SOCIAL XCHANGE</span><br>
        ROLE: <span class="text-accent">VISUAL STRATEGIST &amp; ART DIRECTOR</span>
      </div>
    </div>

    <div class="grid-3col">
      <!-- Poster 1: Zynth Main -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_zynth}" alt="AntiSOCIAL Zynth Main">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">ZYNTH MAIN // AntiSOCIAL</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">PHOTOSHOP • ILLUSTRATOR • 2026</div>
          </div>
          <span class="badge badge-accent" style="padding: 2px 8px; font-size: 10px;">CLUB NIGHT</span>
        </div>
      </div>

      <!-- Poster 2: PullUP -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_pullup}" alt="KharSOCIAL PullUP">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">PULLUP // KharSOCIAL</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">BRUTALIST TYPE • HIP-HOP • 2026</div>
          </div>
          <span class="badge badge-cyan" style="padding: 2px 8px; font-size: 10px;">LINE-UP POST</span>
        </div>
      </div>

      <!-- Poster 3: Social Xchange -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_xchange}" alt="Social Xchange">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">SOCIAL XCHANGE // RESIDENCY</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">GRID ARCHITECTURE • 2026</div>
          </div>
          <span class="badge badge-white" style="padding: 2px 8px; font-size: 10px;">RESIDENCY</span>
        </div>
      </div>
    </div>

    <div class="card" style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
      <div class="mono text-muted" style="font-size: 12px;">
        <strong class="text-white">DESIGN STRATEGY:</strong> Zero-crop artwork preservation with museum-grade exhibit framing. High-contrast typography optimized for rapid thumb-stopping engagement on Instagram feeds.
      </div>
      <div class="mono text-accent" style="font-size: 11px; font-weight: 700;">
        VERIFIED COMMERCIAL ASSETS
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>AntiSOCIAL &amp; KharSOCIAL BRAND CAMPAIGNS</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>BEHANCE: <a href="https://behance.net/shoeabshaikh">behance.net/shoeabshaikh</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 3: GIG POSTERS & EXPERIMENTAL ART (VOL. 2)
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 03 • GIG POSTERS &amp; EXPERIMENTAL ART (VOL. 2)</div>
    <div class="page-num">03 // 12</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px; margin: auto 0; z-index: 5;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <span class="badge badge-cyan" style="margin-bottom: 6px;">KINETIC &amp; TYPOGRAPHIC EXPERIMENTS</span>
        <h2 style="font-size: 38px; letter-spacing: -0.03em;">BOLD TYPOGRAPHY &amp; SUB-CULTURE</h2>
      </div>
      <div class="mono text-muted" style="font-size: 12px; text-align: right;">
        CLIENTS: <span class="text-white">AntiSOCIAL • ChemburSOCIAL • KharSOCIAL</span><br>
        YEAR: <span class="text-cyan">2026 PRODUCTIONS</span>
      </div>
    </div>

    <div class="grid-3col">
      <!-- Poster 1: Heads Will Roll -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_heads}" alt="AntiSOCIAL Heads Will Roll">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">HEADS WILL ROLL // AntiSOCIAL</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">DARK BRUTALISM • NOISE DISTORTION</div>
          </div>
          <span class="badge badge-accent" style="padding: 2px 8px; font-size: 10px;">TECHNO / ELECTRONIC</span>
        </div>
      </div>

      <!-- Poster 2: Desi Class -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_desi}" alt="ChemburSOCIAL Desi Class">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">DESI CLASS // ChemburSOCIAL</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">CULTURAL LOCKUP • SATURATED GRADIENT</div>
          </div>
          <span class="badge badge-cyan" style="padding: 2px 8px; font-size: 10px;">DESI HIP-HOP</span>
        </div>
      </div>

      <!-- Poster 3: House 52 -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_house52}" alt="KharSOCIAL House 52">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">HOUSE 52 // KharSOCIAL</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">MINIMALIST GRID • CLEAN MARGINS</div>
          </div>
          <span class="badge badge-white" style="padding: 2px 8px; font-size: 10px;">HOUSE &amp; TECH</span>
        </div>
      </div>
    </div>

    <div class="card" style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
      <div class="mono text-muted" style="font-size: 12px;">
        <strong class="text-white">PRODUCTION RIGOR:</strong> Balanced optical weight across dense DJ lineups, venue protocols, sponsor placements, and ticket QR integration.
      </div>
      <div class="mono text-cyan" style="font-size: 11px; font-weight: 700;">
        ADOBE CREATIVE SUITE PIPELINE
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>TYPOGRAPHIC SYSTEMS • VENUE COLLATERAL</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 4: 360° CAMPAIGN SUITES (COEUS & MOLO)
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 04 • 360° MULTI-FORMAT CAMPAIGN ARCHITECTURE</div>
    <div class="page-num">04 // 12</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px; margin: auto 0; z-index: 5;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <span class="badge badge-accent" style="margin-bottom: 6px;">CASE STUDY: OMNICHANNEL ADAPTATION</span>
        <h2 style="font-size: 38px; letter-spacing: -0.03em;">COEUS &amp; MOLO CAMPAIGN SUITES</h2>
      </div>
      <div class="mono text-muted" style="font-size: 12px; text-align: right;">
        DELIVERABLES: <span class="text-accent">1:1 Feed • 9:16 Story • 16:9 Banner • Sunboard Spread</span><br>
        OBJECTIVE: <span class="text-white">Seamless Brand Cohesion Across All Digital &amp; Print Touchpoints</span>
      </div>
    </div>

    <!-- 4 Deliverable Showcase for COEUS -->
    <div style="display: grid; grid-template-columns: 3.5fr 4.5fr 2fr 2fr; gap: 20px; align-items: stretch;">
      <!-- Format 1: 1:1 Feed Post -->
      <div class="art-frame" style="height: 540px;">
        <div class="img-container">
          <img src="{img_coeus_final}" alt="COEUS Feed Post 1:1">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">COEUS // FEED POST</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">1:1 SQUARE (1080x1080)</div>
          </div>
          <span class="badge badge-accent" style="padding: 2px 6px; font-size: 9px;">MAIN ART</span>
        </div>
      </div>

      <!-- Format 2: 16:9 Landscape Banner -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="art-frame" style="height: 255px;">
          <div class="img-container">
            <img src="{img_coeus_banner}" alt="COEUS Landscape Web Banner">
          </div>
          <div class="art-caption">
            <div>
              <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">COEUS // WEB BANNER</div>
              <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">16:9 LANDSCAPE (1280x640)</div>
            </div>
            <span class="badge badge-cyan" style="padding: 2px 6px; font-size: 9px;">TICKETING / WEB</span>
          </div>
        </div>

        <div class="art-frame" style="height: 255px;">
          <div class="img-container">
            <img src="{img_molo_banner}" alt="MOLO Skillbox Cover">
          </div>
          <div class="art-caption">
            <div>
              <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">MOLO // TICKETING COVER</div>
              <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">SKILLBOX &amp; INSIDER PORTALS</div>
            </div>
            <span class="badge badge-white" style="padding: 2px 6px; font-size: 9px;">PARTNER PLATFORMS</span>
          </div>
        </div>
      </div>

      <!-- Format 3: 9:16 Story / Reel -->
      <div class="art-frame" style="height: 540px;">
        <div class="img-container">
          <img src="{img_coeus_story}" alt="COEUS Story 9:16">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">COEUS // STORY</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">9:16 VERTICAL</div>
          </div>
          <span class="badge badge-accent" style="padding: 2px 6px; font-size: 9px;">MOBILE</span>
        </div>
      </div>

      <!-- Format 4: Vertical Portal / App Card -->
      <div class="art-frame" style="height: 540px;">
        <div class="img-container">
          <img src="{img_coeus_portal}" alt="COEUS Portal 500x750">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">COEUS // APP TILE</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">500x750 PORTAL CARD</div>
          </div>
          <span class="badge badge-cyan" style="padding: 2px 6px; font-size: 9px;">IN-APP</span>
        </div>
      </div>
    </div>

    <div class="card" style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
      <div class="mono text-muted" style="font-size: 12px;">
        <strong class="text-white">OMNICHANNEL STRATEGY:</strong> Preserving artistic integrity across wildly different aspect ratios. Every format is intentionally composed rather than arbitrarily cropped.
      </div>
      <div class="mono text-accent" style="font-size: 11px; font-weight: 700;">
        COMPLETE CAMPAIGN DELIVERABLE ROLLOUT
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>COEUS &amp; MOLO CAMPAIGN SUITES</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>BEHANCE: <a href="https://behance.net/shoeabshaikh">behance.net/shoeabshaikh</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 5: MULTI-WEEK CAMPAIGNS (DOP SERIES)
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 05 • MULTI-WEEK CAMPAIGN ROLLOUTS (DOP SERIES)</div>
    <div class="page-num">05 // 12</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px; margin: auto 0; z-index: 5;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <span class="badge badge-accent" style="margin-bottom: 6px;">HIGH-CADENCE CAMPAIGN MANAGEMENT</span>
        <h2 style="font-size: 38px; letter-spacing: -0.03em;">DANCE OK PLEASE (DOP) RESIDENCY</h2>
      </div>
      <div class="mono text-muted" style="font-size: 12px; text-align: right;">
        SERIES: <span class="text-white">Multi-Week Consecutive Campaign Architecture</span><br>
        CADENCE: <span class="text-accent">Weekly Iterations • Teasers • Phase Reveals</span>
      </div>
    </div>

    <div class="grid-4col">
      <!-- DOP Card 1: Full Month Schedule -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_dop_cal}" alt="DOP Full Calendar">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">DOP // FULL CALENDAR</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">PROGRAMMING OVERVIEW</div>
          </div>
          <span class="badge badge-accent" style="padding: 2px 6px; font-size: 9px;">PHASE 1</span>
        </div>
      </div>

      <!-- DOP Card 2: Week 2 Post -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_dop_week2_post}" alt="DOP Week 2 Post">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">DOP // WEEK 2 POST</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">EDITION #271 SPOTLIGHT</div>
          </div>
          <span class="badge badge-cyan" style="padding: 2px 6px; font-size: 9px;">WEEK 2</span>
        </div>
      </div>

      <!-- DOP Card 3: Week 1 Story -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_dop_week1_story}" alt="DOP Week 1 Story">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">DOP // SOCIAL STORY</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">9:16 ENGAGEMENT PUSH</div>
          </div>
          <span class="badge badge-white" style="padding: 2px 6px; font-size: 9px;">STORY</span>
        </div>
      </div>

      <!-- DOP Card 4: February Edition -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_dop_feb_post}" alt="DOP Feb Edition">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;" class="heading-font">DOP // FEBRUARY POST</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">CONTINUED IDENTITY</div>
          </div>
          <span class="badge badge-accent" style="padding: 2px 6px; font-size: 9px;">VOL. II</span>
        </div>
      </div>
    </div>

    <div class="card" style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
      <div class="mono text-muted" style="font-size: 12px;">
        <strong class="text-white">CAMPAIGN DISCIPLINE:</strong> Maintaining visual brand cohesion across 4+ consecutive weeks while evolving the design to keep the audience excited for each distinct week.
      </div>
      <div class="mono text-cyan" style="font-size: 11px; font-weight: 700;">
        HIGH-EFFICIENCY ASSET PIPELINE
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>DANCE OK PLEASE (DOP) CAMPAIGN ARCHIVE</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 6: EVENT PROGRAMMING CALENDARS & TYPOGRAPHIC GRIDS
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 06 • EVENT PROGRAMMING CALENDARS &amp; TYPOGRAPHIC GRIDS</div>
    <div class="page-num">06 // 12</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px; margin: auto 0; z-index: 5;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <span class="badge badge-accent" style="margin-bottom: 6px;">COMPLEX INFORMATION ARCHITECTURE</span>
        <h2 style="font-size: 38px; letter-spacing: -0.03em;">MONTHLY PROGRAMMING CALENDARS</h2>
      </div>
      <div class="mono text-muted" style="font-size: 12px; text-align: right;">
        VENUES: <span class="text-white">AntiSOCIAL &amp; KharSOCIAL (Mumbai)</span><br>
        CAPABILITY: <span class="text-accent">High-Density Typographic Systems</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 5.5fr 3.5fr 3fr; gap: 24px; align-items: stretch;">
      <!-- Spread 1: AntiSOCIAL Sunboard -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_cal_anti_sunboard}" alt="AntiSOCIAL June Calendar Sunboard">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">AntiSOCIAL // FULL MONTH SUNBOARD</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">LARGE-FORMAT PHYSICAL EXHIBIT PRINT (8 FT)</div>
          </div>
          <span class="badge badge-accent" style="padding: 2px 8px; font-size: 10px;">PRINT SUNBOARD</span>
        </div>
      </div>

      <!-- Spread 2: KharSOCIAL Sunboard -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_cal_khar_sunboard}" alt="KharSOCIAL May Calendar">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">KharSOCIAL // MONTHLY PROGRAMMING</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">GRID ARCHITECTURE • 30+ ACTS</div>
          </div>
          <span class="badge badge-cyan" style="padding: 2px 8px; font-size: 10px;">MULTI-ACT GRID</span>
        </div>
      </div>

      <!-- Spread 3: Mobile Social Story Calendar -->
      <div class="art-frame" style="height: 560px;">
        <div class="img-container">
          <img src="{img_cal_anti_story}" alt="AntiSOCIAL Story Calendar">
        </div>
        <div class="art-caption">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF;" class="heading-font">AntiSOCIAL // STORY FORMAT</div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">9:16 MOBILE VIEWING OPTIMIZED</div>
          </div>
          <span class="badge badge-white" style="padding: 2px 8px; font-size: 10px;">MOBILE STORY</span>
        </div>
      </div>
    </div>

    <div class="card" style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
      <div class="mono text-muted" style="font-size: 12px;">
        <strong class="text-white">TYPOGRAPHIC MASTERY:</strong> 30+ artists, dates, genres, and ticketing tiers balanced into an effortlessly legible visual matrix suitable for both an iPhone screen and an 8-foot physical venue sunboard.
      </div>
      <div class="mono text-accent" style="font-size: 11px; font-weight: 700;">
        DUAL DIGITAL &amp; PRINT DELIVERY
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>AntiSOCIAL &amp; KharSOCIAL PROGRAMMING SPREADS</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 7: EDITORIAL PUBLICATIONS & CORPORATE PROFILES
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 07 • EDITORIAL PUBLICATIONS &amp; CORPORATE PROFILES</div>
    <div class="page-num">07 // 12</div>
  </div>

  <div style="display: grid; grid-template-columns: 5.5fr 6.5fr; gap: 48px; align-items: center; margin: auto 0; z-index: 5;">
    <div>
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <span class="badge badge-accent">CORPORATE COLLATERAL</span>
        <span class="badge badge-white">MULTI-PAGE BROCHURES</span>
        <span class="badge badge-cyan">EDITORIAL GRIDS</span>
      </div>

      <h2 style="font-size: 44px; line-height: 1.05; margin-bottom: 20px;">
        CORPORATE IDENTITY<br>
        <span class="text-accent">&amp; PUBLICATION DESIGN</span>
      </h2>

      <p class="mono text-muted" style="font-size: 14px; line-height: 1.8; margin-bottom: 24px; border-left: 3px solid #00FF66; padding-left: 18px;">
        Beyond underground nightlife and concert campaigns, my portfolio encompasses formal corporate identities, multi-page company profiles, executive brochures, and product launch collateral.
      </p>

      <div class="card card-featured" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span class="mono text-accent" style="font-size: 11px; font-weight: 700;">FEATURED CASE: F. GHEEWALA KSA</span>
          <span class="badge badge-white">INDESIGN &amp; ILLUSTRATOR</span>
        </div>
        <div class="heading-font" style="font-size: 19px; margin-bottom: 8px;">
          Comprehensive Corporate Profile &amp; Print System
        </div>
        <div class="mono text-muted" style="font-size: 12px; line-height: 1.6;">
          Developed multi-page publication system featuring strict typographic grids, executive infographics, corporate color palettes, and certified pre-press CMYK separation.
        </div>
      </div>

      <div class="card" style="padding: 16px;">
        <div class="mono text-cyan" style="font-size: 11px; font-weight: 700; margin-bottom: 8px;">// KEY PUBLICATION COMPETENCIES</div>
        <div class="mono text-muted" style="font-size: 12px; line-height: 1.6;">
          ✓ Master page architectures &amp; paragraph/character styles in Adobe InDesign<br>
          ✓ Multi-page booklet binding, creep compensation, and print imposition<br>
          ✓ Executive presentation decks &amp; interactive PDF document design
        </div>
      </div>
    </div>

    <!-- Right Side Brochure Preview -->
    <div style="display: flex; gap: 20px; justify-content: center;">
      <div class="art-frame" style="width: 320px; height: 560px;">
        <div class="img-container">
          <img src="{img_brochure_cover}" alt="F. Gheewala Cover">
        </div>
        <div class="art-caption">
          <span style="font-weight:700;">Corporate Cover</span>
          <span style="color:#00FF66;">F. GHEEWALA KSA</span>
        </div>
      </div>

      <div class="art-frame" style="width: 380px; height: 560px;">
        <div class="img-container">
          <img src="{img_brochure_page}" alt="Brochure Inside Spread">
        </div>
        <div class="art-caption">
          <span style="font-weight:700;">Editorial Layout</span>
          <span style="color:#00F0FF;">COMPANY PROFILE</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>F. GHEEWALA KSA • CORPORATE PROFILE &amp; PUBLICATION SYSTEM</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 8: ENTERPRISE FMCG CREDENTIAL — UNILEVER PVT. LTD.
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 08 • ENTERPRISE FMCG SPOTLIGHT</div>
    <div class="page-num">08 // 12</div>
  </div>

  <div style="display: grid; grid-template-columns: 6fr 6fr; gap: 48px; align-items: center; margin: auto 0; z-index: 5;">
    <div>
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <span class="badge badge-blue">ENTERPRISE CREDENTIAL</span>
        <span class="badge badge-white">18-MONTH ENGAGEMENT</span>
        <span class="badge badge-accent">ZERO ERROR TOLERANCE</span>
      </div>

      <h2 style="font-size: 48px; line-height: 1.05; margin-bottom: 16px;">
        ARTWORK PRODUCTION<br>
        SPECIALIST //<br>
        <span style="color: #60a5fa;">UNILEVER PVT. LTD.</span>
      </h2>

      <div class="mono text-muted" style="font-size: 14px; margin-bottom: 24px;">
        TENURE: <span class="text-white" style="font-weight: 700;">FEB 2022 — AUG 2023 (REMOTE)</span> • GLOBAL FMCG PORTFOLIO
      </div>

      <p class="mono text-muted" style="font-size: 14px; line-height: 1.8; margin-bottom: 28px; border-left: 3px solid #3b82f6; padding-left: 18px;">
        Managed print and digital artwork compliance across Unilever's premier FMCG brands. Enforced strict global multi-market brand guidelines, packaging color separation accuracy, barcode standards, and pre-press prep.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="card card-enterprise" style="padding: 18px;">
          <div class="mono" style="color: #60a5fa; font-size: 11px; font-weight: 700; margin-bottom: 6px;">COMPLIANCE STANDARD</div>
          <div class="heading-font" style="font-size: 17px;">MULTI-MARKET PACKAGING</div>
          <div class="mono text-muted" style="font-size: 11px; margin-top: 6px;">Zero defect rate across international legal &amp; nutritional label compliance.</div>
        </div>
        <div class="card card-enterprise" style="padding: 18px;">
          <div class="mono" style="color: #60a5fa; font-size: 11px; font-weight: 700; margin-bottom: 6px;">PRODUCTION SCALE</div>
          <div class="heading-font" style="font-size: 17px;">GLOBAL PRE-PRESS</div>
          <div class="mono text-muted" style="font-size: 11px; margin-top: 6px;">High-volume turnaround adhering to strict brand book guidelines.</div>
        </div>
      </div>
    </div>

    <!-- Right Column: Case Analysis -->
    <div class="card card-enterprise" style="padding: 34px; display: flex; flex-direction: column; gap: 22px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(59, 130, 246, 0.3); padding-bottom: 14px;">
        <span class="mono" style="font-size: 13px; color: #93c5fd; font-weight: 700;">// ENTERPRISE IMPACT METRICS</span>
        <span class="badge badge-blue">GLOBAL FMCG</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 18px;">
        <div style="display: flex; gap: 16px;">
          <div class="mono" style="color: #60a5fa; font-size: 20px; font-weight: 900;">01</div>
          <div>
            <div class="heading-font" style="font-size: 17px; color: #FFFFFF;">PACKAGING PRE-PRESS CERTIFICATION</div>
            <div class="mono text-muted" style="font-size: 12px; margin-top: 4px; line-height: 1.6;">
              Prepared print-ready files across gravure, flexo, and offset printing pipelines with precise trapping, overprint settings, and die-line alignments.
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 16px;">
          <div class="mono" style="color: #60a5fa; font-size: 20px; font-weight: 900;">02</div>
          <div>
            <div class="heading-font" style="font-size: 17px; color: #FFFFFF;">COLOR FIDELITY ACROSS GLOBAL SUPPLY CHAINS</div>
            <div class="mono text-muted" style="font-size: 12px; margin-top: 4px; line-height: 1.6;">
              Maintained brand color consistency using standardized Delta-E tolerances and spot Pantone separations across varied packaging substrates (cartons, films, foils, tins).
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 16px;">
          <div class="mono" style="color: #60a5fa; font-size: 20px; font-weight: 900;">03</div>
          <div>
            <div class="heading-font" style="font-size: 17px; color: #FFFFFF;">WHY THIS MATTERS TO PROSPECTIVE CLIENTS</div>
            <div class="mono text-muted" style="font-size: 12px; margin-top: 4px; line-height: 1.6;">
              Proves the rare capability to balance daring creative expression with enterprise-level operational discipline, organized file hierarchies, and on-time delivery under strict scrutiny.
            </div>
          </div>
        </div>
      </div>

      <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 8px; padding: 14px 18px; font-family: 'Space Mono', monospace; font-size: 11px; color: #bfdbfe;">
        ✓ FULL VERIFICATION AVAILABLE UPON REQUEST • 18 MONTH RECORD OF COMPLIANCE
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>UNILEVER PVT. LTD. • ARTWORK PRODUCTION SPECIALIST</div>
    <div>CONTACT: <a href="mailto:shoeab2007@gmail.com">shoeab2007@gmail.com</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 9: EXECUTIVE PROFILE & CORE PHILOSOPHY
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 09 • EXECUTIVE PROFILE &amp; PHILOSOPHY</div>
    <div class="page-num">09 // 12</div>
  </div>

  <div style="display: grid; grid-template-columns: 5fr 7fr; gap: 48px; align-items: start; margin: auto 0; z-index: 5;">
    <div>
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <span class="badge badge-accent">EXECUTIVE OVERVIEW</span>
        <span class="badge badge-white">DESIGN SYSTEM</span>
      </div>
      <h2 style="font-size: 52px; line-height: 1.05; margin-bottom: 24px;">
        CREATIVE RIGOR<br>
        <span class="text-accent">&amp; PRODUCTION</span><br>
        DISCIPLINE
      </h2>
      <p class="mono text-muted" style="font-size: 14px; line-height: 1.8; margin-bottom: 24px;">
        A visual strategist with 9+ years bridging the gap between underground nightlife energy and strict enterprise brand stewardship. Equal parts creative art director and technical production specialist.
      </p>

      <div class="card" style="margin-bottom: 20px;">
        <div class="mono text-accent" style="font-size: 11px; font-weight: 700; margin-bottom: 10px;">// ACADEMIC FOUNDATION</div>
        <div class="heading-font" style="font-size: 17px;">B.Sc. in Computer Science</div>
        <div class="mono text-muted" style="font-size: 12px; margin-top: 4px;">Maharashtra College of Arts, Science &amp; Commerce (Mumbai University) • 2017</div>
        <div class="mono text-muted" style="font-size: 11px; margin-top: 8px; color: rgba(255, 255, 255, 0.5);">
          Combined algorithmic thinking and technical rigor with commercial graphic design, signage, and print production.
        </div>
      </div>

      <div class="card">
        <div class="mono text-cyan" style="font-size: 11px; font-weight: 700; margin-bottom: 10px;">// MULTILINGUAL FLUENCY (4 SPOKEN LANGUAGES)</div>
        <div style="display: flex; gap: 8px;">
          <span class="badge badge-white">ENGLISH</span>
          <span class="badge badge-white">HINDI</span>
          <span class="badge badge-white">MARATHI</span>
          <span class="badge badge-white">URDU</span>
        </div>
      </div>
    </div>

    <!-- Right Side 3 Core Pillars -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="card card-featured">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="badge badge-accent">PILLAR 01</span>
          <span class="mono" style="font-size: 11px; color: rgba(255, 255, 255, 0.4);">HIGH IMPACT</span>
        </div>
        <h3 style="font-size: 24px; margin-bottom: 10px;">HIGH-OCTANE BRAND &amp; NIGHTLIFE IDENTITY</h3>
        <p class="mono text-muted" style="font-size: 13px; line-height: 1.7;">
          Brutalist typography, experimental kinetic layouts, and eye-catching event posters for marquee venues including AntiSOCIAL, KharSOCIAL, and KoregaonSOCIAL. Designed with zero-crop artwork preservation to maintain legibility, sponsor tiers, and lineups across all digital and print displays.
        </p>
      </div>

      <div class="card card-enterprise">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="badge badge-blue">PILLAR 02</span>
          <span class="mono" style="font-size: 11px; color: rgba(255, 255, 255, 0.4);">ENTERPRISE GRADE</span>
        </div>
        <h3 style="font-size: 24px; margin-bottom: 10px;">ENTERPRISE PRE-PRESS &amp; ARTWORK COMPLIANCE</h3>
        <p class="mono text-muted" style="font-size: 13px; line-height: 1.7;">
          Proven enterprise discipline managing Unilever's multi-market packaging compliance. Flawless execution across CMYK/Pantone separations, bleed/safe-zone boundaries, barcoding standards, and regulatory requirements with zero margin for error.
        </p>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="badge badge-cyan">PILLAR 03</span>
          <span class="mono" style="font-size: 11px; color: rgba(255, 255, 255, 0.4);">OMNICHANNEL</span>
        </div>
        <h3 style="font-size: 24px; margin-bottom: 10px;">360° MULTI-DELIVERABLE CAMPAIGN ARCHITECTURE</h3>
        <p class="mono text-muted" style="font-size: 13px; line-height: 1.7;">
          Translating core campaign identities seamlessly into complete deliverable suites: Instagram Feed Posts (1:1 / 4:5), Stories &amp; Reels (9:16), Web Banners (16:9), and Physical Large-Format Venue Sunboard Spreads.
        </p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>SHOEAB AHMED // VISUAL STRATEGIST</div>
    <div>CONTACT: <a href="mailto:shoeab2007@gmail.com">shoeab2007@gmail.com</a> • +91 90822 67615</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 10: SOFTWARE ARSENAL & PRODUCTION TOOLKIT
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 10 • SOFTWARE ARSENAL &amp; PRODUCTION TOOLKIT</div>
    <div class="page-num">10 // 12</div>
  </div>

  <div style="display: flex; flex-direction: column; justify-content: center; gap: 32px; margin: auto 0; z-index: 5;">
    <div>
      <span class="badge badge-accent" style="margin-bottom: 14px;">TECHNICAL PROFICIENCIES</span>
      <h2 style="font-size: 48px; line-height: 1.05;">
        CREATIVE SUITE ARSENAL<br>
        <span class="text-accent">&amp; PRODUCTION MASTERY</span>
      </h2>
      <p class="mono text-muted" style="font-size: 14px; margin-top: 10px;">
        Complete end-to-end command of industry-standard design, motion graphics, and print production pipelines.
      </p>
    </div>

    <div class="grid-3col">
      <!-- Column 1: Graphic Design & Pre-Press -->
      <div class="card" style="padding: 26px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
          <span class="mono text-accent" style="font-size: 12px; font-weight: 700;">// GRAPHIC &amp; BRAND DESIGN</span>
          <span class="badge badge-accent">PRIMARY</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800;" class="heading-font">
              <span>ADOBE PHOTOSHOP</span>
              <span class="text-accent mono" style="font-size: 13px;">9+ YRS</span>
            </div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Advanced compositing, color grading, texture generation &amp; retouching.</div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800;" class="heading-font">
              <span>ADOBE ILLUSTRATOR</span>
              <span class="text-accent mono" style="font-size: 13px;">9+ YRS</span>
            </div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Vector branding, logo systems, iconography &amp; typographic layouts.</div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800;" class="heading-font">
              <span>ADOBE INDESIGN</span>
              <span class="text-accent mono" style="font-size: 13px;">8+ YRS</span>
            </div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Multi-page editorial catalogs, corporate profiles &amp; publication grids.</div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800;" class="heading-font">
              <span>CORELDRAW</span>
              <span class="text-accent mono" style="font-size: 13px;">8+ YRS</span>
            </div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Signage design, large-format hoardings &amp; architectural print specs.</div>
          </div>
        </div>
      </div>

      <!-- Column 2: Video & Kinetic Motion -->
      <div class="card" style="padding: 26px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
          <span class="mono text-cyan" style="font-size: 12px; font-weight: 700;">// MOTION &amp; VIDEO EDITING</span>
          <span class="badge badge-cyan">KINETIC</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800;" class="heading-font">
              <span>ADOBE PREMIERE PRO</span>
              <span class="text-cyan mono" style="font-size: 13px;">7+ YRS</span>
            </div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Event recap videos, teaser cuts, pacing, beat-sync &amp; audio mixing.</div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800;" class="heading-font">
              <span>ADOBE AFTER EFFECTS</span>
              <span class="text-cyan mono" style="font-size: 13px;">6+ YRS</span>
            </div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Kinetic typography, animated gig poster loops &amp; logo reveals.</div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800;" class="heading-font">
              <span>FINAL CUT PRO</span>
              <span class="text-cyan mono" style="font-size: 13px;">5+ YRS</span>
            </div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Rapid turnaround video editing &amp; high-res social media exporting.</div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800;" class="heading-font">
              <span>CANVA / RAPID PROTOTYPING</span>
              <span class="text-cyan mono" style="font-size: 13px;">ADVANCED</span>
            </div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Client-side template systems and fast marketing asset turnarounds.</div>
          </div>
        </div>
      </div>

      <!-- Column 3: Production Discipline & Quality Assurance -->
      <div class="card" style="padding: 26px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
          <span class="mono text-white" style="font-size: 12px; font-weight: 700;">// PRODUCTION STANDARDS</span>
          <span class="badge badge-white">STANDARDS</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="card" style="background: rgba(255,255,255,0.03); padding: 14px;">
            <div class="heading-font" style="font-size: 15px;">CMYK &amp; SPOT COLOR PRE-PRESS</div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Color calibration, Pantone matching, dot gain compensation &amp; plate setups.</div>
          </div>
          <div class="card" style="background: rgba(255,255,255,0.03); padding: 14px;">
            <div class="heading-font" style="font-size: 15px;">LARGE-FORMAT SUNBOARDS &amp; VINYL</div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">High-resolution scale ratios, bleed margins &amp; substrate optimization.</div>
          </div>
          <div class="card" style="background: rgba(255,255,255,0.03); padding: 14px;">
            <div class="heading-font" style="font-size: 15px;">ENTERPRISE BRAND RIGOR</div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Global packaging compliance, legal text scales &amp; barcode standards.</div>
          </div>
          <div class="card" style="background: rgba(255,255,255,0.03); padding: 14px;">
            <div class="heading-font" style="font-size: 15px;">OMNICHANNEL SOCIAL SUITES</div>
            <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Lossless WebP/PNG compression, safe-zones for Stories, Reels &amp; carousels.</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>TECHNICAL MASTERY • PRE-PRESS CERTIFIED PRODUCTION</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 11: WORK EXPERIENCE TIMELINE (2011 — PRESENT)
     ============================================================= -->
<div class="slide">
  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 11 • WORK EXPERIENCE &amp; CLIENT ENGAGEMENTS</div>
    <div class="page-num">11 // 12</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 20px; margin: auto 0; z-index: 5;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <span class="badge badge-accent" style="margin-bottom: 8px;">CAREER ROADMAP</span>
        <h2 style="font-size: 40px; letter-spacing: -0.03em;">9+ YEARS PROFESSIONAL MILESTONES</h2>
      </div>
      <div class="mono text-muted" style="font-size: 12px; text-align: right;">
        VERIFIED COMMERCIAL TIMELINE • 2011 — PRESENT<br>
        <span class="text-accent">STEADY CAREER PROGRESSION &amp; VERSATILITY</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <!-- Left Column: Recent Roles -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="heading-font" style="font-size: 16px; color: #FFFFFF;">VCK BRAND COMMUNICATIONS</span>
            <span class="badge badge-accent" style="padding: 2px 8px; font-size: 9px;">OCT 2025 — MAR 2026</span>
          </div>
          <div class="mono text-accent" style="font-size: 11px; font-weight: 700; margin: 4px 0;">Graphic Designer</div>
          <div class="mono text-muted" style="font-size: 11px; line-height: 1.5;">
            Led social media design output for client brands and produced on-site photo/video content during live shoots. Kept visual assets strictly aligned to brand guidelines.
          </div>
        </div>

        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="heading-font" style="font-size: 16px; color: #FFFFFF;">BIN MESHLEH HOLDINGS</span>
            <span class="badge badge-cyan" style="padding: 2px 8px; font-size: 9px;">APR 2025 — SEP 2025</span>
          </div>
          <div class="mono text-cyan" style="font-size: 11px; font-weight: 700; margin: 4px 0;">Graphic Designer, Social Media Manager &amp; Photographer</div>
          <div class="mono text-muted" style="font-size: 11px; line-height: 1.5;">
            Designed auction campaign posters, managed vehicle photography pipeline end-to-end, and directed high-volume auction promotions.
          </div>
        </div>

        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="heading-font" style="font-size: 16px; color: #FFFFFF;">AFp.net (FREELANCE)</span>
            <span class="badge badge-white" style="padding: 2px 8px; font-size: 9px;">FEB 2025 — MAR 2025</span>
          </div>
          <div class="mono text-white" style="font-size: 11px; font-weight: 700; margin: 4px 0;">Freelance Graphic Designer</div>
          <div class="mono text-muted" style="font-size: 11px; line-height: 1.5;">
            Produced posters, social assets, and ticketing collateral for live music events across India on accelerated event timelines.
          </div>
        </div>

        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="heading-font" style="font-size: 16px; color: #FFFFFF;">ALBURAQ VENTURE PVT. LTD.</span>
            <span class="badge badge-white" style="padding: 2px 8px; font-size: 9px;">MAY 2024 — DEC 2024</span>
          </div>
          <div class="mono text-white" style="font-size: 11px; font-weight: 700; margin: 4px 0;">Graphic Designer</div>
          <div class="mono text-muted" style="font-size: 11px; line-height: 1.5;">
            Owned brand consistency across logo systems, marketing collateral, and brochures for company visual identity and product launches.
          </div>
        </div>
      </div>

      <!-- Right Column: Enterprise & Earlier Roles -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="card card-enterprise" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="heading-font" style="font-size: 16px; color: #FFFFFF;">UNILEVER PVT. LTD. (REMOTE)</span>
            <span class="badge badge-blue" style="padding: 2px 8px; font-size: 9px;">FEB 2022 — AUG 2023</span>
          </div>
          <div class="mono" style="color: #60a5fa; font-size: 11px; font-weight: 700; margin: 4px 0;">Artwork Production Specialist (Enterprise FMCG)</div>
          <div class="mono text-muted" style="font-size: 11px; line-height: 1.5;">
            Managed high-volume packaging artwork compliance across Unilever's global FMCG portfolio. Enforced multi-market brand guidelines, color separation, and pre-press standards.
          </div>
        </div>

        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="heading-font" style="font-size: 16px; color: #FFFFFF;">F. GHEEWALA HUMAN RESOURCES</span>
            <span class="badge badge-white" style="padding: 2px 8px; font-size: 9px;">JUL 2021 — JAN 2022</span>
          </div>
          <div class="mono text-white" style="font-size: 11px; font-weight: 700; margin: 4px 0;">Graphic Designer</div>
          <div class="mono text-muted" style="font-size: 11px; line-height: 1.5;">
            In-house designer for social media posts, corporate brochures, and brand guideline documentation.
          </div>
        </div>

        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="heading-font" style="font-size: 16px; color: #FFFFFF;">SNOOP TECHNOLOGIES PVT. LTD.</span>
            <span class="badge badge-white" style="padding: 2px 8px; font-size: 9px;">MAY 2019 — DEC 2020</span>
          </div>
          <div class="mono text-white" style="font-size: 11px; font-weight: 700; margin: 4px 0;">Graphic Designer</div>
          <div class="mono text-muted" style="font-size: 11px; line-height: 1.5;">
            Designed logos, flyers, product packaging, and brochures; edited promo videos in Premiere Pro, After Effects, and Final Cut Pro.
          </div>
        </div>

        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="heading-font" style="font-size: 16px; color: #FFFFFF;">TEKNOVANCE &amp; SHABAB DIGITAL</span>
            <span class="badge badge-white" style="padding: 2px 8px; font-size: 9px;">2011 — 2019</span>
          </div>
          <div class="mono text-white" style="font-size: 11px; font-weight: 700; margin: 4px 0;">Graphic Designer &amp; Signage Specialist</div>
          <div class="mono text-muted" style="font-size: 11px; line-height: 1.5;">
            Designed commercial signage, cabinet layouts for US client, and shop hoardings in CorelDraw and Photoshop.
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>FULL RESUME AVAILABLE IN PDF FORMAT</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>


<!-- =============================================================
     SLIDE 12: CALL TO ACTION & CONNECT
     ============================================================= -->
<div class="slide">
  <div class="glow-green" style="bottom: -100px; right: -100px;"></div>
  <div class="glow-cyan" style="top: -150px; left: -150px;"></div>

  <div class="slide-header">
    <div class="brand">
      <span class="pulse-dot"></span>
      <span>SHOEAB AHMED // PORTFOLIO ARCHIVE 2026</span>
    </div>
    <div class="category">// 12 • COLLABORATION &amp; CONTACT</div>
    <div class="page-num">12 // 12</div>
  </div>

  <div style="display: grid; grid-template-columns: 6fr 6fr; gap: 64px; align-items: center; margin: auto 0; z-index: 5;">
    <div>
      <div style="display: flex; gap: 8px; margin-bottom: 20px;">
        <span class="badge badge-accent">LET'S CONNECT</span>
        <span class="badge badge-cyan">IMMEDIATE AVAILABILITY</span>
      </div>

      <h2 style="font-size: 64px; line-height: 0.95; margin-bottom: 24px; letter-spacing: -0.04em;">
        LET'S CREATE<br>
        <span class="text-accent">TOGETHER</span>
      </h2>

      <p class="mono text-muted" style="font-size: 14px; line-height: 1.8; margin-bottom: 32px; border-left: 3px solid #00FF66; padding-left: 20px;">
        Available for full-time roles, creative contracts, brand identity systems, 360° campaign suites, and enterprise artwork production. Turning marketing visions into visuals that ship on time.
      </p>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Email Link -->
        <a href="mailto:shoeab2007@gmail.com" class="card card-featured" style="text-decoration: none; display: flex; align-items: center; justify-content: space-between; padding: 18px 24px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="mono text-accent" style="font-size: 20px;">✉</div>
            <div>
              <div class="mono text-accent" style="font-size: 10px; font-weight: 700;">DIRECT EMAIL</div>
              <div class="heading-font" style="font-size: 20px; color: #FFFFFF;">shoeab2007@gmail.com</div>
            </div>
          </div>
          <span class="badge badge-accent">CLICK TO SEND ↗</span>
        </a>

        <!-- Phone / WhatsApp Link -->
        <a href="https://wa.me/919082267615" target="_blank" class="card" style="text-decoration: none; display: flex; align-items: center; justify-content: space-between; padding: 18px 24px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="mono" style="color: #25D366; font-size: 20px;">💬</div>
            <div>
              <div class="mono text-muted" style="font-size: 10px; font-weight: 700;">WHATSAPP &amp; PHONE (INDIA)</div>
              <div class="heading-font" style="font-size: 20px; color: #FFFFFF;">+91 90822 67615</div>
            </div>
          </div>
          <span class="badge" style="background: rgba(37, 211, 102, 0.15); border: 1px solid #25D366; color: #25D366;">CHAT ON WHATSAPP ↗</span>
        </a>
      </div>
    </div>

    <!-- Right Side: Links & Verification Cards -->
    <div style="display: flex; flex-direction: column; gap: 18px;">
      <!-- LinkedIn Card -->
      <a href="https://www.linkedin.com/in/shaikhshoeab/" target="_blank" class="card" style="text-decoration: none; display: flex; align-items: center; justify-content: space-between; padding: 22px 28px;">
        <div>
          <div class="mono text-cyan" style="font-size: 11px; font-weight: 700; margin-bottom: 4px;">// PROFESSIONAL NETWORK</div>
          <div class="heading-font" style="font-size: 20px; color: #FFFFFF;">
            LINKEDIN // SHAIKHSHOEAB
          </div>
          <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Connect for hiring, recommendations &amp; career background</div>
        </div>
        <span class="badge badge-cyan" style="font-size: 12px; padding: 8px 16px;">VIEW PROFILE ↗</span>
      </a>

      <!-- Behance Card -->
      <a href="https://behance.net/shoeabshaikh" target="_blank" class="card" style="text-decoration: none; display: flex; align-items: center; justify-content: space-between; padding: 22px 28px;">
        <div>
          <div class="mono text-accent" style="font-size: 11px; font-weight: 700; margin-bottom: 4px;">// CREATIVE CASE STUDIES</div>
          <div class="heading-font" style="font-size: 20px; color: #FFFFFF;">
            BEHANCE // SHOEABSHAIKH
          </div>
          <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">Explore detailed case studies and design breakdowns</div>
        </div>
        <span class="badge badge-accent" style="font-size: 12px; padding: 8px 16px;">VIEW BEHANCE ↗</span>
      </a>

      <!-- Live Web Portfolio Card -->
      <a href="https://shoeab2007.github.io/portfolio/" target="_blank" class="card" style="text-decoration: none; display: flex; align-items: center; justify-content: space-between; padding: 22px 28px;">
        <div>
          <div class="mono text-white" style="font-size: 11px; font-weight: 700; margin-bottom: 4px;">// INTERACTIVE ARCHIVE</div>
          <div class="heading-font" style="font-size: 20px; color: #FFFFFF;">
            LIVE PORTFOLIO WEBSITE
          </div>
          <div class="mono text-muted" style="font-size: 11px; margin-top: 4px;">shoeab2007.github.io/portfolio (Matter.js 2D physics &amp; multi-deliverable viewer)</div>
        </div>
        <span class="badge badge-white" style="font-size: 12px; padding: 8px 16px;">OPEN SITE ↗</span>
      </a>
    </div>
  </div>

  <div class="slide-footer">
    <div>SHOEAB AHMED • MUMBAI, INDIA • OPEN TO GLOBAL REMOTE &amp; RELOCATION</div>
    <div>PORTFOLIO: <a href="https://shoeab2007.github.io/portfolio/">shoeab2007.github.io/portfolio</a></div>
    <div>LINKEDIN: <a href="https://www.linkedin.com/in/shaikhshoeab/">linkedin.com/in/shaikhshoeab</a></div>
  </div>
</div>

</body>
</html>"""
    return html

def main():
    print("=== Re-compiling Shoeab Ahmed LinkedIn Portfolio Deck with Refined Compact Typography ===")
    os.makedirs(os.path.dirname(HTML_FILE), exist_ok=True)
    os.makedirs(PREVIEWS_DIR, exist_ok=True)

    html = build_html()
    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(html)

    temp_pdf = os.path.join(WORKSPACE_DIR, 'scratch', 'deck_render_temp.pdf')
    if os.path.exists(temp_pdf):
        try:
            os.remove(temp_pdf)
        except Exception:
            pass

    cmd = [
        CHROME_PATH,
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        '--no-sandbox',
        f'--print-to-pdf={temp_pdf}',
        HTML_FILE
    ]

    res = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    if res.returncode != 0:
        print(f"Chrome error: {res.stderr}")
        sys.exit(1)

    pdf_size_mb = os.path.getsize(temp_pdf) / (1024 * 1024)
    print(f"New PDF rendered successfully: {temp_pdf} ({pdf_size_mb:.2f} MB)")

    # Attempt to copy to master PDF, fallback to v2 if locked by open PDF reader
    try:
        shutil.copy2(temp_pdf, OUTPUT_PDF)
        print(f"Master PDF updated: {OUTPUT_PDF}")
    except PermissionError:
        v2_path = os.path.join(WORKSPACE_DIR, 'Shoeab_Ahmed_LinkedIn_Portfolio_v2.pdf')
        shutil.copy2(temp_pdf, v2_path)
        print(f"Notice: {OUTPUT_PDF} is currently open in a PDF viewer.")
        print(f"Updated PDF saved as: {v2_path}")

    # Always generate previews from the newly compiled temp_pdf
    doc = pymupdf.open(temp_pdf)
    print(f"Total Page Count: {len(doc)} pages")
    
    artifact_previews = r'C:\Users\Shoeab\.gemini\antigravity\brain\2bf48dd0-b93f-4450-9413-9d590dcdd139\previews'
    os.makedirs(artifact_previews, exist_ok=True)

    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        p1 = os.path.join(PREVIEWS_DIR, f"slide_{i+1:02d}.png")
        p2 = os.path.join(artifact_previews, f"slide_{i+1:02d}.png")
        pix.save(p1)
        pix.save(p2)
    
    # Sync script to brain artifact directory
    shutil.copy2(
        os.path.join(WORKSPACE_DIR, 'generate_linkedin_portfolio.py'),
        r'C:\Users\Shoeab\.gemini\antigravity\brain\2bf48dd0-b93f-4450-9413-9d590dcdd139\generate_linkedin_portfolio.py'
    )
    print("=== Typography Update & Previews Rendered Successfully! ===")

if __name__ == '__main__':
    main()
