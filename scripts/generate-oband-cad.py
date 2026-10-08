"""Illustrative STEP solids for the user-confirmed O-band instrument assembly.
Outer mainframe envelope is published; bay and module geometry is estimated.
"""
from pathlib import Path
import importlib.util, json
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('cad',Path(__file__).with_name('generate-reference-cad.py'))
cad=importlib.util.module_from_spec(spec);spec.loader.exec_module(cad)

def shell(s):
 s.box('silver left electronics enclosure',253,145,545,-40,8,-272.5)
 s.box('silver bottom plate',173,3,545,-213,8,-272.5)
 s.box('silver removable top cover',173,3,545,-213,150,-272.5)
 s.box('silver right wall',3,139,545,-213,11,-272.5)
 s.box('silver horizontal bay divider',170,3,535,-210,47,-272.5)
 # Both front and rear of the extended TLS bay are open.
 s.box('silver compact bay rear wall',170,100,8,-210,50,264.5)
 for x in [-84,-120,-156]:s.box('silver vertical slot divider',2,100,535,x,50,-272.5)
 s.box('silver left front panel',249,141,3,-38,10,-275.5)
 s.box('black display bezel',145,102,2,42,27,-277.5)
 s.box('screen glass',132,88,1,48,34,-280.5)
 s.rod('silver rotary control',(2,88,-276),(2,88,-287),18)
 for i in range(5):s.box('black screen key',12,7,3,25,38+i*18,-282)
 for y in range(26,59,12):
  for x in [-18,-3,12]:s.box('black keypad key',10,7,3,x,y,-282)
 for x in [-165,165]:
  for z in [-190,190]:s.box('black foot',25,8,25,x-12.5,0,z-12.5)

def laser(s):
 s.box('silver TLS extended body',156,30,490,-78,0,0)
 s.box('silver horizontal front panel',160,32,4,-80,0,-4)
 s.box('black model nameplate',64,9,2,-32,18,-6)
 for x in [-48,48]:
  s.rod('gold optical connector',(x,10,-4),(x,10,-26),7)
  s.rod('black port aperture',(x,10,-26),(x,10,-27),3)
 for z in range(30,460,40):s.box('black ventilation',1,12,15,78,8,z)
 s.box('silver rear extraction handle',90,8,12,-45,10,490)

def interface(s):
 s.box('silver compact interface body',32,75,150,-16,0,0)
 s.box('silver front panel',32,75,3,-16,0,-3)
 s.box('black model nameplate',24,12,2,-12,58,-5)
 s.rod('silver head cable connector',(0,22,-3),(0,22,-18),8)
 s.rod('black electrical socket',(0,22,-18),(0,22,-19),5)
 s.box('silver extraction latch',12,8,9,-6,1,-12)

def adapter(s,y=14,z=0):
 s.rod('silver adapter body',(0,y,z),(0,y,z-16),14)
 s.rod('silver FC coupling sleeve',(0,y,z-16),(0,y,z-26),7)
 s.rod('black optical aperture',(0,y,z-26),(0,y,z-27),3)

def head(s):
 s.rod('black optical head enclosure',(0,28,22),(0,28,-22),28,32)
 s.rod('silver front ring',(0,28,-22),(0,28,-26),20,32)
 adapter(s,28,-26)
 s.box('black head support',38,6,30,-19,0,-15)
 s.rod('black electrical cable stub',(0,28,22),(0,28,38),5)

for id,fn in [('oband-mainframe-8164b',shell),('oband-laser-81606a',laser),('oband-head-interface',interface),('oband-head-81624b',head),('oband-adapter-81000fa',adapter)]:
 folder=root/'public/library/references'/id;folder.mkdir(parents=True,exist_ok=True)
 source=folder/(id+'-Reference.step')
 # Protect user/vendor replacements; only seed missing or known generated CAD.
 catalog=json.loads((root/'public/library/equipment.json').read_text(encoding='utf-8'))['equipment']
 existing=next((e for e in catalog if e['id']==id),None)
 if existing and (existing.get('cadKind')!='Illustrative reference' or existing.get('stepPath')!='library/references/'+id+'/'+source.name):
  print('Preserved replacement',id);continue
 model=cad.Step();fn(model);model.save(source);print(source)
