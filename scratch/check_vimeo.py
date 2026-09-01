import urllib.request, re, json

url = 'https://vimeo.com/showcase/12389928'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        print('Showcase fetched! Length:', len(html))
        # Find video clips or clip IDs
        clip_matches = re.findall(r'/videos/(\\d+)', html) + re.findall(r'vimeo\\.com/(\\d{7,12})', html)
        print('Unique clip IDs:', set(clip_matches))
        
        # Check title
        m_title = re.search(r'<title>(.*?)</title>', html)
        if m_title:
            print('Title:', m_title.group(1))
except Exception as e:
    print('Error:', e)
