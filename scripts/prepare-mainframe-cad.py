"""Refresh only the generated 8163B reference shell and its provenance.
Never replace an uploaded/vendor model. Convert the resulting STEP separately.
"""
from pathlib import Path
import importlib.util, json, hashlib
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('cad',Path(__file__).with_name('generate-reference-cad.py'))
cad=importlib.util.module_from_spec(spec);spec.loader.exec_module(cad)
path=root/'public/library/equipment.json'
data=json.loads(path.read_text(encoding='utf-8'))
item=next(e for e in data['equipment'] if e['id']=='wst-mainframe-manual')
if item.get('cadKind')!='Illustrative reference' or not item.get('stepPath','').endswith('wst-mainframe-manual-Reference.step'):
 raise SystemExit('Existing model is not the generated reference; preserved it.')
source=root/'public'/item['stepPath']
model=cad.Step();cad.mainframe_8163b(model);model.save(source)
review='Generated 8163B shell with two open bays for 81940A and 81634B. Published outer dimensions; slot offsets, wall thickness and panel details illustrative. Verify installed order against a bench photo.'
item.update(name='Laser & sensor mainframe',role='Houses the 81940A tunable laser source and 81634B optical power sensor in two compact slots.',url='https://www.keysight.com/us/en/product/8163B/lightwave-multimeter.html',cadReview=review,stepSha256=hashlib.sha256(source.read_bytes()).hexdigest())
item['specs']=[r for r in item['specs'] if r[0] not in ['Compact module slots','Installed modules']]+[['Compact module slots','2'],['Installed modules','81940A tunable laser source + 81634B power sensor (user-confirmed housing)']]
item['modelReference']='STEP: '+item['stepPath']+'\nGLB: '+item['model3d']+'\n'+review
path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
provenance=source.parent/'provenance.json'
record=json.loads(provenance.read_text(encoding='utf-8'))
record.update(generatedAt='2026-10-08',review=review,assembly='Two compact bays; app stores module instance IDs and editable Slot 1/2 assignments separately.')
provenance.write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(source)
