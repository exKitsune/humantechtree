"""Resolve the catalog against a local ZIM. No network access is used.

pip install -r scripts/requirements.txt
python scripts/offline-import.py --archive F:/Wikipedia/wikipedia_en_all_maxi_2026-08.zim

Full article text stays in the ignored .cache/wiki-research directory. Only a
small reference index is published. Finding an article is NOT fact-checking
the catalog's dates or proposed relationships.
"""
import argparse
import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
# Also support isolated local installs without changing the system Python.
if (ROOT / '.cache/python').is_dir():
    sys.path.insert(0, str(ROOT / '.cache/python'))
from libzim.reader import Archive
from bs4 import BeautifulSoup

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--archive', type=Path, required=True)
parser.add_argument('--ids', help='Comma-separated node ids, for focused research')
args = parser.parse_args()
if args.archive.suffix != '.zim' or not args.archive.is_file():
    parser.error('Provide a completed .zim file, not a .part download.')
archive = Archive(args.archive)
nodes = json.loads((ROOT / 'public/data/catalog.json').read_text(encoding='utf8'))['nodes']
metadata = json.loads((ROOT / 'public/data/wikipedia.json').read_text(encoding='utf8'))
if args.ids:
    nodes = [n for n in nodes if n['id'] in args.ids.split(',')]
cache = ROOT / '.cache/wiki-research'
cache.mkdir(parents=True, exist_ok=True)
out = ROOT / 'public/data/offline-index.json'
index = json.loads(out.read_text(encoding='utf8')) if out.exists() else {}
found = 0
missing = []
for n in nodes:
    titles = list(dict.fromkeys([n['wiki'], metadata.get(n['id'], {}).get('title', n['wiki'])]))
    entry = None
    for title in titles:
        paths = [title.replace(' ', '_'), 'A/' + title.replace(' ', '_')]
        for path in paths:
            if archive.has_entry_by_path(path):
                entry = archive.get_entry_by_path(path)
                break
        if entry is None and archive.has_entry_by_title(title):
            entry = archive.get_entry_by_title(title)
        if entry is not None:
            break
    if entry is None:
        missing.append({'id': n['id'], 'title': n['wiki']})
        index[n['id']] = {'found': False, 'requestedTitle': n['wiki']}
        continue
    seen = set()
    while entry.is_redirect and entry.path not in seen:
        seen.add(entry.path)
        entry = entry.get_redirect_entry()
    item = entry.get_item()
    if 'html' not in item.mimetype:
        missing.append({'id':n['id'], 'title':n['wiki'], 'reason':'non-HTML entry'})
        continue
    soup = BeautifulSoup(bytes(item.content), 'html.parser')
    for el in soup.select('script, style, nav, .mw-editsection'):
        el.decompose()
    article = soup.select_one('#mw-content-text') or soup.select_one('body') or soup
    title = entry.title
    url = f'https://en.wikipedia.org/wiki/{quote(title.replace(" ", "_"))}'
    text = article.get_text('\n', strip=True)
    (cache / f'{n["id"]}.txt').write_text(
        f'{title}\nSource: {url}\nArchive: {args.archive.name}\n'
        'Wikipedia contributors; text generally CC BY-SA 4.0. See article attribution and exceptions.\n\n' + text,
        encoding='utf8')
    index[n['id']] = {
        'found': True, 'title': title, 'path': entry.path, 'url': url,
        'archive': args.archive.name, 'archiveUuid': str(archive.uuid),
        'checked': datetime.now(timezone.utc).date().isoformat(),
        'claimReview': 'pending'
    }
    found += 1
    if found % 100 == 0:
        print(f'Located {found} articles in offline archive.', flush=True)
out.write_text(json.dumps(index, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
(cache / 'missing.json').write_text(json.dumps(missing, indent=2), encoding='utf8')
print(json.dumps({'matched':found, 'missing':missing, 'archiveArticles':archive.article_count}, indent=2))
