import os
import json
import hashlib
import uuid
from http.server import SimpleHTTPRequestHandler, HTTPServer, ThreadingHTTPServer
from email.parser import BytesParser
from email.policy import default

PORT = 8000

def extract_format_info(filename, ext):
    lower = filename.lower()
    if ext == '.mp4' or 'motion' in lower or 'video' in lower or 'teaser' in lower:
        return {'label': 'Motion Reel (MP4)', 'type': 'video', 'ratio': '9:16 (Video)', 'priority': 1}
    if 'post' in lower or 'feed' in lower or '1x1' in lower or 'square' in lower:
        return {'label': 'Feed Post (1:1 / 4:5)', 'type': 'image', 'ratio': '1:1 (Square/Post)', 'priority': 2}
    if 'story' in lower or '9x16' in lower or '9_16' in lower:
        return {'label': 'Story / Reel (9:16)', 'type': 'image', 'ratio': '9:16 (Vertical)', 'priority': 3}
    if 'cover' in lower or 'banner' in lower or '16x9' in lower or '16_9' in lower:
        return {'label': 'Cover Banner (16:9)', 'type': 'image', 'ratio': '16:9 (Landscape)', 'priority': 4}
    if 'sunboard' in lower or 'spread' in lower:
        return {'label': 'Sunboard Print Spread', 'type': 'image', 'ratio': 'Print Sunboard', 'priority': 5}
    if ext == '.pdf':
        return {'label': 'Corporate Profile (PDF)', 'type': 'pdf', 'ratio': 'PDF Document', 'priority': 6}
    return {'label': 'Main Deliverable', 'type': 'video' if ext == '.mp4' else 'image', 'ratio': 'Primary Artwork', 'priority': 2}

def scan_assets():
    import re
    from collections import defaultdict
    print("Scanning asset directories to build initial projects list...")
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dirs_to_scan = {
        '01_Gig_Posters': 'Gig Posters',
        '02_Campaign_and_Promos': 'Campaigns & Promos',
        '02_Event_Calendars': 'Event Calendars',
        '04_Brochures': 'Brochures'
    }
    
    raw_assets = []
    for rel_dir, folder_category in dirs_to_scan.items():
        full_dir = os.path.join(base_dir, rel_dir)
        if not os.path.isdir(full_dir):
            continue
            
        for root, _, files in os.walk(full_dir):
            sub_rel = os.path.relpath(root, full_dir)
            subfolder_name = "" if sub_rel == "." else sub_rel.replace('\\', '/')
            
            for file in files:
                if file.startswith('.') or file.lower() == 'thumbs.db' or 'open mic #32' in file.lower() or 'open mic' in file.lower():
                    continue
                    
                ext = os.path.splitext(file)[1].lower()
                if ext not in ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.pdf', '.webp']:
                    continue
                    
                file_abs = os.path.join(root, file)
                rel_path = os.path.relpath(file_abs, base_dir).replace('\\', '/')
                media_url = '/' + rel_path
                proj_id = hashlib.md5(rel_path.encode('utf-8')).hexdigest()
                filename_no_ext = os.path.splitext(file)[0]
                
                fmt = extract_format_info(file, ext)
                raw_assets.append({
                    'id': proj_id,
                    'file': file,
                    'rel_path': rel_path,
                    'media': media_url,
                    'folder': rel_dir,
                    'subfolder': subfolder_name,
                    'category': folder_category,
                    'ext': ext,
                    'filename_no_ext': filename_no_ext,
                    'fmt': fmt
                })

    def get_group_key(item):
        folder = item['folder']
        sub = item['subfolder']
        name = item['filename_no_ext']
        clean_name = re.sub(r'(?i)\b(post|story|cover|banner|teaser|final|finasl|weeks|week|sunboard|reels?)\b', '', name)
        clean_name = re.sub(r'[_\s-]+', ' ', clean_name).strip()
        return (folder, sub, clean_name.lower() or name.lower())

    grouped = defaultdict(list)
    for item in raw_assets:
        k = get_group_key(item)
        grouped[k].append(item)

    projects = []
    for k, items in grouped.items():
        items.sort(key=lambda x: x['fmt']['priority'])
        primary = items[0]
        
        rel_dir = primary['folder']
        subfolder_name = primary['subfolder']
        ext = primary['ext']
        filename_no_ext = primary['filename_no_ext']
        
        title = filename_no_ext.replace('_', ' ').replace('-', ' ').strip()
        category = primary['category']
        role = 'Visual Strategist & Art Director'
        client = 'Shoeab Shaikh'
        year = '2025'
        strategy = 'A curated design experiment focusing on brand strategy and visual execution.'
        tech = 'Photoshop, Illustrator'
        
        for word in title.split():
            if word.isdigit() and len(word) == 4 and word.startswith('20'):
                year = word
                
        if rel_dir == '01_Gig_Posters':
            if ext == '.mp4' or any(it['ext'] == '.mp4' for it in items):
                tech = 'After Effects, Premiere Pro, Photoshop'
                strategy = 'Dynamic kinetic motion poster & collateral suite for live music and nightlife event promotion.'
            else:
                tech = 'Photoshop, Illustrator'
                strategy = 'High-contrast brutalist gig poster design created for premier nightlife venues.'
            
            lower_path = primary['rel_path'].lower()
            if 'antisocial' in lower_path:
                client = 'AntiSOCIAL'
            elif 'kharsocial' in lower_path:
                client = 'KharSOCIAL'
            elif 'koregaonsocial' in lower_path or 'koregaon' in lower_path:
                client = 'KoregaonSOCIAL'
            elif 'chembur' in lower_path:
                client = 'ChemburSOCIAL'
            elif 'malad' in lower_path:
                client = 'MaladSOCIAL'
            elif 'circuitx' in lower_path:
                client = 'CircuitX'

        elif rel_dir == '02_Campaign_and_Promos':
            lower_path = primary['rel_path'].lower()
            if 'coeus' in lower_path:
                client = 'COEUS'
                strategy = 'Visual identity and branding system developed for COEUS, focusing on strategic minimalist aesthetics.'
                tech = 'Photoshop, Illustrator'
            elif 'molo' in lower_path:
                client = 'Molo'
                strategy = 'Modern visual communication and branding campaign layout for MOLO events.'
                tech = 'Photoshop, Illustrator, InDesign'
            elif 'dop' in lower_path:
                client = 'DOP Series'
                strategy = 'Multi-week campaign covers, calendars, and story assets for DOP music experiences.'
                tech = 'Photoshop, After Effects'
            elif 'hospitality' in lower_path:
                client = 'Hospitality Group'
                strategy = 'Promotional visual assets and digital collateral for premium hospitality venues.'
                tech = 'Photoshop, Lightroom, Premiere'
            elif 'metaraph' in lower_path:
                client = 'Metaraph'
                strategy = 'Editorial nightlife branding and promo collateral for Metaraph tour dates.'
                tech = 'Photoshop, Illustrator'

        elif rel_dir == '02_Event_Calendars':
            strategy = 'Monthly event programming calendars, teaser animations, and print sunboard schedules.'
            tech = 'After Effects, Photoshop, InDesign' if (ext == '.mp4' or any(it['ext'] == '.mp4' for it in items)) else 'Photoshop, InDesign'
            lower_path = primary['rel_path'].lower()
            if 'anti' in lower_path:
                client = 'AntiSOCIAL Calendar'
            elif 'khar' in lower_path:
                client = 'KharSOCIAL Calendar'

        elif rel_dir == '04_Brochures':
            title = title + ' Profile'
            client = 'F.Gheewala KSA'
            strategy = 'Comprehensive corporate profile and print-ready multi-page brochure system.'
            tech = 'InDesign, Illustrator'

        # Clean up title formatting
        words = title.split()
        cleaned_words = []
        for word in words:
            if word.isdigit() and len(word) == 4 and word.startswith('20'):
                continue
            if word.lower() in ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']:
                continue
            if word.lower() in ['antisocial', 'kharsocial', 'koregaonsocial', 'chemburdsocial', 'socialxchange', 'social', 'maladsocial']:
                continue
            if word.lower() in ['post', 'story', 'cover', 'weeks', 'week', 'calendar', 'calender', 'final', 'finasl']:
                continue
            cleaned_words.append(word)
        
        if cleaned_words:
            title = ' '.join(cleaned_words)
        title = title.title().strip()
        if not title:
            title = filename_no_ext.replace('_', ' ').title()

        variants = []
        for it in items:
            variants.append({
                'id': it['id'],
                'label': it['fmt']['label'],
                'media': it['media'],
                'type': it['fmt']['type'],
                'ratio': it['fmt']['ratio'],
                'file': it['file']
            })

        projects.append({
            'id': primary['id'],
            'title': title,
            'category': category,
            'folder': rel_dir,
            'subfolder': subfolder_name,
            'role': role,
            'client': client,
            'year': year,
            'strategy': strategy,
            'tech': tech,
            'media': primary['media'],
            'type': primary['fmt']['type'],
            'variants': variants,
            'is_default': True
        })
                
    # Sort projects: by year desc, then title
    projects.sort(key=lambda x: (x['year'], x['title']), reverse=True)
    print(f"Scanned {len(projects)} diversified portfolio assets (grouped with format variations).")
    return projects

class PortfolioRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable caching so updates reflect instantly
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/upload':
            self.handle_upload()
        elif self.path == '/api/delete':
            self.handle_delete()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_upload(self):
        try:
            content_type = self.headers.get('Content-Type', '')
            if not content_type.startswith('multipart/form-data'):
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Content-Type must be multipart/form-data")
                return

            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)

            # Reconstruct data to be parsed by email BytesParser
            headers_bytes = f"Content-Type: {content_type}\r\n\r\n".encode('utf-8')
            msg = BytesParser(policy=default).parsebytes(headers_bytes + body)

            fields = {}
            file_data = None
            filename = None

            for part in msg.iter_parts():
                name = part.get_param('name', header='content-disposition')
                if not name:
                    continue
                fn = part.get_filename()
                if fn:
                    filename = fn
                    file_data = part.get_payload(decode=True)
                else:
                    fields[name] = part.get_content().strip()

            if not file_data or not filename:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"No media file uploaded")
                return

            # Save uploaded file inside website/uploads
            ext = os.path.splitext(filename)[1].lower()
            unique_filename = f"{uuid.uuid4()}{ext}"
            uploads_dir = os.path.join(os.path.dirname(__file__), 'website', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            
            file_path = os.path.join(uploads_dir, unique_filename)
            with open(file_path, 'wb') as f:
                f.write(file_data)

            media_url = f"/website/uploads/{unique_filename}"
            proj_type = 'video' if ext == '.mp4' else ('pdf' if ext == '.pdf' else 'image')
            
            new_project = {
                'id': str(uuid.uuid4()),
                'title': fields.get('title', 'Untitled'),
                'category': fields.get('category', 'Branding'),
                'role': fields.get('role', 'Visual Strategist & Art Director'),
                'client': fields.get('client', 'Shoeab Shaikh'),
                'year': fields.get('year', '2025'),
                'strategy': fields.get('strategy', 'A custom uploaded art project.'),
                'tech': fields.get('tech', 'Photoshop, Illustrator'),
                'media': media_url,
                'type': proj_type,
                'is_default': False
            }

            # Update JSON file
            json_path = os.path.join(os.path.dirname(__file__), 'website', 'projects.json')
            projects = []
            if os.path.exists(json_path):
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        projects = json.load(f)
                except Exception:
                    projects = []
            
            # Place custom items at the very top of list
            projects.insert(0, new_project)
            
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(projects, f, indent=2, ensure_ascii=False)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'project': new_project}).encode('utf-8'))
            print(f"Successfully uploaded: {new_project['title']} -> {media_url}")

        except Exception as e:
            import traceback
            traceback.print_exc()
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Error processing upload: {str(e)}".encode('utf-8'))

    def handle_delete(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            proj_id = data.get('id')
            
            if not proj_id:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Missing project id")
                return

            json_path = os.path.join(os.path.dirname(__file__), 'website', 'projects.json')
            if not os.path.exists(json_path):
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"projects.json database does not exist")
                return

            with open(json_path, 'r', encoding='utf-8') as f:
                projects = json.load(f)

            project_to_delete = None
            for p in projects:
                if p['id'] == proj_id:
                    project_to_delete = p
                    break

            if not project_to_delete:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"Project not found")
                return

            if project_to_delete.get('is_default'):
                self.send_response(403)
                self.end_headers()
                self.wfile.write(b"Default files cannot be deleted from the database")
                return

            projects.remove(project_to_delete)

            # Delete the file associated with it
            media_path = project_to_delete['media']
            if media_path.startswith('/'):
                media_path = media_path[1:]
            
            full_file_path = os.path.join(os.path.dirname(__file__), media_path.replace('/', os.sep))
            if os.path.exists(full_file_path):
                try:
                    os.remove(full_file_path)
                    print(f"Deleted physical file: {full_file_path}")
                except Exception as e:
                    print(f"Error deleting physical file {full_file_path}: {e}")

            # Save updated json database
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(projects, f, indent=2, ensure_ascii=False)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
            print(f"Successfully deleted project: {proj_id}")

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Error processing delete: {str(e)}".encode('utf-8'))

def init_database():
    os.makedirs(os.path.join(os.path.dirname(__file__), 'website'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), 'website', 'uploads'), exist_ok=True)
    json_path = os.path.join(os.path.dirname(__file__), 'website', 'projects.json')
    
    scanned_projects = scan_assets()
    
    custom_projects = []
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                existing = json.load(f)
                custom_projects = [p for p in existing if not p.get('is_default', True)]
        except Exception:
            custom_projects = []
            
    # Combine custom uploads first, then scanned default projects
    all_projects = custom_projects + scanned_projects
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(all_projects, f, indent=2, ensure_ascii=False)
    print(f"Updated website/projects.json: {len(custom_projects)} custom uploads, {len(scanned_projects)} scanned assets.")

if __name__ == '__main__':
    init_database()
    
    # We want to redirect path '/' to '/website/index.html' when running the server
    # We can handle redirection by overriding simple handler redirect
    class RedirectHandler(PortfolioRequestHandler):
        def do_GET(self):
            if self.path == '/' or self.path == '':
                self.send_response(301)
                self.send_header('Location', '/website/index.html')
                self.end_headers()
                return
            super().do_GET()

    print(f"Starting server on http://localhost:{PORT} ...")
    server = ThreadingHTTPServer(('0.0.0.0', PORT), RedirectHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()
