"""Illustrative silhouettes from Setup 4 photos; millimetres/Y-up, not measured CAD.
Existing source files are preserved. No vendor CAD or native mates are claimed.
"""
from pathlib import Path
import importlib.util
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('reference',root/'scripts/generate-reference-cad.py')
ref=importlib.util.module_from_spec(spec);spec.loader.exec_module(ref)
def geometry(kind):
 s=ref.Step()
 if kind=='santec-tsl570-setup4':
  s.box('silver white laser enclosure',250,160,310,-125,0,-155)
  s.box('black touchscreen bezel',150,103,3,-100,25,-158)
  s.box('screen glass',136,89,1,-93,32,-162)
  s.rod('copper power key',(-105,18,-155),(-105,18,-164),8)
  s.rod('silver optical output',(90,37,-155),(90,37,-175),10)
 elif kind=='santec-mpm210-setup4':
  s.box('silver white power meter',250,160,310,-125,0,-155)
  s.box('black channel panel',42,116,2,-63,22,-158)
  for x in [-5,45,95]:s.box('silver blank module bay',46,122,3,x-23,18,-158)
  for y in [34,66,98,130]:s.rod('silver optical socket',(-42,y,-160),(-42,y,-171),5)
  for y in [46,82,118]:s.box('dark channel key',13,13,3,-103,y,-160)
 elif kind in ['chip4-upper-display','chip4-lower-display']:
  upper=kind=='chip4-upper-display';w,h=(410,335) if upper else (350,225)
  s.box('silver display frame' if upper else 'black display frame',w,h,24,-w/2,55,-12)
  s.box('screen panel',w-28,h-28,2,-w/2+14,69,-15)
  s.box('black stand neck',35,55,30,-17.5,0,-5)
  s.box('black stand foot',160,7,100,-80,0,-50)
 elif kind=='chip4-pc-tower':
  s.box('black tower enclosure',160,400,350,-80,0,-175)
  for y in [80,110,140,170]:s.box('dark front grille',140,8,2,-70,y,-177)
  s.box('silver drive bezel',130,20,2,-65,320,-178)
  s.rod('silver power button',(50,275,-175),(50,275,-180),7)
 elif kind=='chip4-shelf':
  s.box('silver shelf deck',1250,24,300,-625,540,-150)
  for x in [-590,590]:s.box('silver extrusion post',40,540,40,x-20,0,-20)
  s.box('silver crossbar',1140,30,30,-570,300,-15)
 elif kind=='chip4-copper-holder':
  s.box('copper sample block',85,27,70,-42.5,0,-35)
  s.box('silver mounting plate',45,5,38,-22.5,27,-19)
  for x in [-12,12]:s.rod('silver fixture screw',(x,32,0),(x,42,0),4)
 else:raise ValueError(kind)
 return s
if __name__=='__main__':
 for kind in ['santec-tsl570-setup4','santec-mpm210-setup4','chip4-upper-display','chip4-lower-display','chip4-pc-tower','chip4-shelf']:
  file=root/f'public/library/references/{kind}/{kind}-Reference.step';file.parent.mkdir(parents=True,exist_ok=True)
  if file.exists():print('Preserved',kind);continue
  geometry(kind).save(file);print('Created illustrative',kind)
