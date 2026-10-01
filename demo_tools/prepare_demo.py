"""Fetch public evidence, template background and open-license fonts for the demo.

Does not copy full news articles. Stores source metadata, retrieval hashes and
short factual paraphrases. Forecasts and business histories are synthetic.
"""
from pathlib import Path
from datetime import datetime, timezone
from html.parser import HTMLParser
import hashlib
import json
import zipfile
import requests

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'

class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []
    def handle_data(self, value):
        self.parts.append(value)

def main():
    manifest = json.loads((ASSETS / 'demo-sources.json').read_text(encoding='utf-8'))
    for source in manifest['sources']:
        response = requests.get(source['url'], timeout=45)
        response.raise_for_status()
        parser = PlainText(); parser.feed(response.content.decode('utf-8', errors='replace'))
        text = ' '.join(' '.join(parser.parts).split())
        for expected in source['verify_tokens']:
            if expected not in text:
                raise ValueError(f"Missing evidence token {expected}: {source['id']}")
        source['retrieved_at'] = datetime.now(timezone.utc).isoformat()
        source['response_sha256'] = hashlib.sha256(response.content).hexdigest()
        source['resolved_url'] = response.url
        print('Verified:', source['id'], flush=True)
    (ASSETS / 'demo-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    with zipfile.ZipFile(ROOT.parent / 'Cosmetics PPT Template by EaTemp.pptx') as deck:
        (ASSETS / 'demo-background.png').write_bytes(deck.read('ppt/media/image12.png'))
    font_dir = ASSETS / 'fonts'; font_dir.mkdir(exist_ok=True)
    fonts = {
        'DMSerifDisplay-Regular.ttf': 'dmserifdisplay/DMSerifDisplay-Regular.ttf',
        'DMMono-Regular.ttf': 'dmmono/DMMono-Regular.ttf',
        'Inter.ttf': 'inter/Inter%5Bopsz,wght%5D.ttf',
        'PlayfairDisplay.ttf': 'playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf',
    }
    for name, remote in fonts.items():
        r = requests.get('https://raw.githubusercontent.com/google/fonts/main/ofl/' + remote, timeout=45)
        r.raise_for_status(); (font_dir / name).write_bytes(r.content)
    for family in ['dmserifdisplay','dmmono','inter','playfairdisplay']:
        r = requests.get(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt', timeout=45)
        r.raise_for_status()
        license_text='\n'.join(line.rstrip() for line in r.content.decode('utf-8').splitlines()).rstrip()+'\n'
        (font_dir / (family + '-OFL.txt')).write_text(license_text, encoding='utf-8')
    print('Template background and licensed fonts ready.', flush=True)

if __name__ == '__main__':
    main()
