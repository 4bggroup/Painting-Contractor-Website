#!/usr/bin/env python3
"""Bundle the editable website into one offline HTML file; no dependencies."""
from pathlib import Path
import argparse
import base64
import re

root=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output',type=Path,default=root/'Painting_Contractor_One_Page.html')
args=parser.parse_args()
source=(root/'index.html').read_text(encoding='utf-8')
def css(match):
    return '<style>\n'+(root/match.group(1)).read_text(encoding='utf-8')+'\n</style>'
source=re.sub(r'<link rel="stylesheet" href="([^"]+)">',css,source)
scripts=[]
def script(match):
    name=match.group(1)
    scripts.append('/* '+name+' */\n'+(root/name).read_text(encoding='utf-8'))
    return ''
source=re.sub(r'<script src="([^"]+)" defer></script>',script,source)
source=source.replace('</body>','<script>\n'+'\n'.join(scripts)+'\n</script>\n</body>')
for asset in sorted((root/'assets').rglob('*')):
    if asset.suffix not in ['.webp','.svg','.woff']:
        continue
    mime={'.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff'}[asset.suffix]
    encoded='data:'+mime+';base64,'+base64.b64encode(asset.read_bytes()).decode('ascii')
    source=source.replace(asset.relative_to(root).as_posix(),encoded)
args.output.parent.mkdir(parents=True,exist_ok=True)
args.output.write_text(source,encoding='utf-8')
print(str(args.output))
