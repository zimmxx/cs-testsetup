"""Prepare the CC0 Innerscene/MakeHuman avatar; run from repository root.

Download URL and provenance live in public/library/people/ATTRIBUTION.md.
Input: .local/technician-source.glb. Output: self-contained, resized-texture GLB.
"""
import io
import json
import struct
from pathlib import Path
from PIL import Image

source = Path('.local/technician-source.glb').read_bytes()
length = struct.unpack_from('<I', source, 12)[0]
doc = json.loads(source[20:20 + length])
binary = source[28 + length:]
images = {image['bufferView']: image for image in doc.get('images', [])}
packed = bytearray()
for index, view in enumerate(doc['bufferViews']):
    offset = view.get('byteOffset', 0)
    data = binary[offset:offset + view['byteLength']]
    if index in images:
        image = Image.open(io.BytesIO(data))
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        if image.mode in ('RGBA', 'LA') or 'transparency' in image.info:
            image.save(output, format='PNG', optimize=True)
            images[index]['mimeType'] = 'image/png'
        else:
            image.convert('RGB').save(output, format='JPEG', quality=86, optimize=True)
            images[index]['mimeType'] = 'image/jpeg'
        data = output.getvalue()
    packed.extend(b'\0' * ((-len(packed)) % 4))
    view.update(byteOffset=len(packed), byteLength=len(data))
    packed.extend(data)

# Remove the held briefcase instance; keep the source skeleton intact.
for node in doc['nodes']:
    if node.get('name') == 'Briefcase':
        node.pop('mesh', None)
        node.pop('skin', None)
doc['asset']['copyright'] = 'CC0-1.0. Innerscene, adapted from MakeHuman CC0 assets; technician adaptation by CORNERSTONE Test Setup.'
doc['asset']['extras'] = {'source': 'https://www.innerscene.com/tools/library/3d-parts/idle-standing-harper-3d-person-animated-ba9bc23f', 'license': 'CC0-1.0', 'changes': 'Textures resized to 1024 px; briefcase hidden. Clothing adaptation and procedural bench poses applied by runtime.'}
doc['buffers'][0]['byteLength'] = len(packed)
encoded = json.dumps(doc, separators=(',', ':')).encode()
encoded += b' ' * ((-len(encoded)) % 4)
packed.extend(b'\0' * ((-len(packed)) % 4))
output = struct.pack('<III', 0x46546C67, 2, 28 + len(encoded) + len(packed)) + struct.pack('<II', len(encoded), 0x4E4F534A) + encoded + struct.pack('<II', len(packed), 0x004E4942) + packed
Path('public/library/people/lab-technician.glb').write_bytes(output)
print(f'Technician: {len(source):,} -> {len(output):,} bytes')
