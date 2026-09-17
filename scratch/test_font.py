import base64
import subprocess
import pymupdf
import os

WORKSPACE_DIR = r'c:\Users\Shoeab\Downloads\Portfolio_Assets'
CHROME_PATH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

with open(os.path.join(WORKSPACE_DIR, 'scratch', 'fonts', 'InterTight-Variable.ttf'), 'rb') as f:
    b64_tight = base64.b64encode(f.read()).decode('utf-8')

with open(os.path.join(WORKSPACE_DIR, 'scratch', 'fonts', 'SpaceMono-Bold.ttf'), 'rb') as f:
    b64_mono_bold = base64.b64encode(f.read()).decode('utf-8')

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@page {{ size: 1920px 1080px; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
@font-face {{
    font-family: 'Inter Tight';
    src: url('data:font/truetype;charset=utf-8;base64,{b64_tight}') format('truetype');
    font-weight: 100 900;
    font-style: normal;
}}
@font-face {{
    font-family: 'Space Mono';
    src: url('data:font/truetype;charset=utf-8;base64,{b64_mono_bold}') format('truetype');
    font-weight: 700;
    font-style: normal;
}}
body {{
    background: #000000;
    color: #FFFFFF;
    padding: 100px;
    font-family: 'Inter Tight', sans-serif;
}}
.tag {{
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    color: #00FF66;
    letter-spacing: 0.1em;
    margin-bottom: 24px;
    text-transform: uppercase;
}}
h1 {{
    font-size: 96px;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 0.92;
    text-transform: uppercase;
    margin-bottom: 20px;
}}
.accent {{ color: #00FF66; }}
h2 {{
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.01em;
    text-transform: uppercase;
    color: #FFFFFF;
    margin-bottom: 20px;
}}
p {{
    font-family: 'Space Mono', monospace;
    font-size: 15px;
    color: rgba(255,255,255,0.7);
    line-height: 1.6;
    max-width: 800px;
}}
</style>
</head>
<body>
<div class="tag">// CREATIVE DIRECTION &amp; VISUAL STRATEGY</div>
<h1>SHOEAB<br><span class="accent">AHMED</span></h1>
<h2>GRAPHIC DESIGNER &amp; VISUAL STRATEGIST</h2>
<p>Specializing in brand identity, high-energy event visuals, 360° social media campaigns, and enterprise artwork compliance.</p>
</body>
</html>"""

html_path = os.path.join(WORKSPACE_DIR, 'scratch', 'test_inter_tight.html')
pdf_path = os.path.join(WORKSPACE_DIR, 'scratch', 'test_inter_tight.pdf')
png_path = os.path.join(WORKSPACE_DIR, 'scratch', 'test_inter_tight.png')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

cmd = [
    CHROME_PATH,
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--no-sandbox',
    f'--print-to-pdf={pdf_path}',
    html_path
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome returncode:", res.returncode)

doc = pymupdf.open(pdf_path)
pix = doc[0].get_pixmap(dpi=150)
pix.save(png_path)
print("Rendered successfully to:", png_path)
