"""Generate honest, replaceable STEP presentation references for missing CAD.
No generated dimensions constitute an engineering drawing or approved mounting.
Existing vendor models and locally entered equipment specifications are retained.
"""
from pathlib import Path
import json, math, shutil, hashlib, sys
import importlib.util
module_spec=importlib.util.spec_from_file_location('reference_cad',Path(__file__).with_name('generate-reference-cad.py'))
reference_cad=importlib.util.module_from_spec(module_spec);module_spec.loader.exec_module(reference_cad);Step=reference_cad.Step

ROOT=Path(__file__).resolve().parents[1]
LIB=ROOT/'public/library'
data=json.loads((LIB/'equipment.json').read_text(encoding='utf-8'))
items=data['equipment']

def add(id,name,model,category,url):
 if not any(e['id']==id for e in items):items.append(dict(id=id,name=name,model=model,category=category,url=url,specs=[],location='Wafer-scale testing · installation to verify',status='Needs verification',role=name,alternatives='',note='Equipment reported by user; separate from the legacy manual wafer bench. Installed options and availability to verify.',image='',model3d=''))
add('wst-laser-new','New tunable laser source','Keysight N7776C','Optical source','https://www.keysight.com/us/en/product/N7776C/tunable-laser-source-high-power-lowest-sse-top-line.html')
add('wst-head-interface-new','Optical head interface','Keysight N7749C','Detection','https://www.keysight.com/us/en/product/N7749C/optical-head-interface.html')
add('wst-power-head-new','Optical power meter head','Keysight 8162-C series · exact variant pending','Detection','https://www.keysight.com/us/en/assets/3121-1226/data-sheets/8162-C-and-N7749C-Optical-Power-Meter-Heads-and-Optical-Head-Interface.pdf')
add('wst-picoammeter','Picoammeter / voltage source','Keithley 6487','Electrical','https://www.tek.com/en/products/keithley/low-level-sensitive-and-specialty-instruments/series-6400-picoammeters')
add('wst-power-supply','DC power supply','Keysight E3640A','Electrical','https://www.keysight.com/us/en/product/E3640A/30w-power-supply-8v-3a-20v-1-5a.html')
add('wst-fibre-pm5-manual','Alternative PM patch cable','Thorlabs P3-1550PM-FC-5','Fibre optics','https://www.thorlabs.com/item/P3-1550PM-FC-5')
add('optical-bench-reference','Optical test bench','1800 × 900 mm · suggested reference','Positioning','https://www.thorlabs.com/optical-tables-and-breadboards')

def instrument(s,w,h,d,kind='bench'):
 s.box('silver enclosure',w,h,d,-w/2,8,-d/2)
 s.box('front panel',w-4,h-4,3,-w/2+2,10,-d/2-3)
 if kind=='module':
  s.box('black name plate',w-8,12,1,-w/2+4,h-10,-d/2-4)
  s.rod('gold optical port',(0,25,-d/2-4),(0,25,-d/2-13),7)
  s.rod('black port aperture',(0,25,-d/2-13),(0,25,-d/2-14),3)
  s.box('silver extraction latch',12,10,12,-6,9,-d/2-16)
  for z in range(int(-d/2+18),int(d/2-16),24):
   for y in [24,46,67]:s.box('black vent',1,12,8,w/2,y,z)
 else:
  s.box('black display bezel',w*.47,h*.42,2,-w*.43,h*.4,-d/2-5)
  s.box('screen glass',w*.39,h*.3,1,-w*.39,h*.46,-d/2-7)
  for i in range(4):s.box('black control key',w*.055,6,3,w*.12+i*w*.07,22,-d/2-7)
  s.rod('silver rotary control',(w*.3,h*.65,-d/2-4),(w*.3,h*.65,-d/2-14),h*.11)
  for x in [-w*.35,w*.35]:
   for z in [-d*.35,d*.35]:s.box('black foot',18,8,18,x-9,0,z-9)
def stage(s):
 for i,(w,d) in enumerate([(180,160),(160,140),(135,115)]):s.box('silver motion deck',w,18,d,-w/2,i*18,-d/2)
 for a,b in [((80,30,0),(135,30,0)),((0,48,-50),(0,48,-100)),((-60,40,30),(-95,40,30))]:s.rod('black micrometer',a,b,8)
def camera(s):
 s.box('black camera housing',58,48,45,-29,130,-22)
 s.rod('black lens',(0,125,0),(0,85,0),16)
 s.rod('silver camera stand',(45,0,0),(45,145,0),6)
 s.box('silver stand foot',100,12,80,-25,0,-40)
def arm(s):
 s.box('silver provisional arm base',70,12,60,-35,0,-30)
 s.rod('silver upright',(0,12,0),(0,70,0),7)
 s.rod('silver angle arm',(0,65,0),(70,75,0),5)
 s.box('black fibre clamp',25,12,20,58,69,-10)
 s.rod('gold fibre tip',(80,70,0),(83,52,0),.7)
def holder(s,chip=False):
 if chip:s.box('copper chip block',70,25,60,-35,0,-30);s.box('dark DUT',12,1,12,-6,25,-6)
 else:s.rod('black printed wafer holder',(0,0,0),(0,10,0),90,64);s.rod('wafer illustrative',(0,10,0),(0,11,0),76,64)
def cable(s):
 for i in range(32):
  a=i*2*math.pi/32;b=(i+1)*2*math.pi/32;s.rod('gold cable',(65*math.cos(a),5,65*math.sin(a)),(65*math.cos(b),5,65*math.sin(b)),1.5,8)
 for x in [-70,70]:s.rod('silver FC connector',(x,5,-20),(x,5,20),5)
def bench(s):
 s.box('silver perforated tabletop',1800,80,900,-900,-80,-450)
 for x in [-650,650]:
  for z in [-300,300]:s.rod('black bench leg',(x,-80,z),(x,-700,z),65)

source819='https://www.keysight.com/us/en/assets/7018-01142/data-sheets/5988-8518.pdf'
source8163='https://www.keysight.com/us/en/assets/7018-01037/data-sheets/5988-3924.pdf'
vendor={
 'wst-polarisation-manual':('fpc562/FPC562-Step.step','fpc562','Vendor CAD','User-supplied FPC562 STEP. Verify paddle orientation and mounting.'),
 'fibre-arm-stage':('max313d/MAX313D-Step.step','max313d','Vendor CAD','User-supplied MAX313D STEP. Two instances support the fibre arms; mounting interfaces remain to confirm.'),
 'wst-mating-sleeve-manual':('adafcpmb2/ADAFCPMB2-Vendor.step','adafcpmb2','Vendor CAD','Official Thorlabs STEP. Narrow-key mating sleeve; inspect installed connector options.'),
 'wst-fibre-pm2-manual':('p3-1550pm-fc-2/P3-1550PM-FC-2-Vendor.step','pm-patch-2m','Vendor CAD','Vendor display geometry does not depict the full 2 m installed cable routing.'),
 'wst-fibre-sm-manual':('p3-smf28y-fc-5/P3-SMF28Y-FC-5-Vendor.step','sm-patch-5m','Vendor CAD','Original uncut vendor geometry. Actual bench fibre is cleaved; cut length and tip preparation are not represented.'),
 'wst-fibre-pm5-manual':('p3-1550pm-fc-5/P3-1550PM-FC-5-Vendor.step','pm-patch-5m','Vendor CAD','Original vendor geometry, shortened cable routing for presentation. Verify that the 5 m alternative cable is installed before using it.'),
 'wst-picoammeter':('keithley6487/Model 6487/6487-sales-04-04-2014.stp','keithley6487','Vendor CAD','Official Keithley CAD archive. Source Y-up axes retained; verify rear clearances.'),
 'polarisation':('fpc562/FPC562-Step.step','fpc562','Vendor reference · unconfirmed model','FPC562 chosen as a visual reference; this generic record has no confirmed installed part number.'),
 'stage':('max313d/MAX313D-Step.step','max313d','Vendor reference · unconfirmed model','MAX313D reference only. Does not identify the generic stage or the manual DUT motion stage.'),
}
links={'polarisation':'https://www.thorlabs.com/item/FPC562','stage':'https://www.thorlabs.com/3-axis-nanomax-tm-flexure-stages','fibre':'https://www.thorlabs.com/optical-fiber-fiber-patch-cables','camera':'https://gtvision.co.uk/collections/usb-hdmi-cameras','electrical':'https://www.keysight.com/us/en/products/power-supplies.html','band-source':'https://www.keysight.com/us/en/products/photonic-products/optical-component-test-products/tunable-laser-sources.html','band-detector':'https://www.keysight.com/us/en/products/photonic-products/optical-component-test-products/optical-power-measurement-products.html'}
for e in items:
 id=e['id']
 # A later upload or reviewed model must not be silently overwritten.
 # --refresh is only for deliberately regenerating the seeded references.
 if e.get('stepPath') and '--refresh' not in sys.argv:continue
 if id in links:e['url']=links[id]
 if id in vendor:
  source,out,kind,review=vendor[id];e.update(stepPath='library/references/'+source,model3d='library/models/'+out+'.glb',cadKind=kind,cadReview=review)
  continue
 s=Step();dimension='Estimated presentation geometry; not an engineering dimension';review='Generated illustrative geometry. Confirm the installed model, dimensions, ports and mounting before replacing it with vendor or measured CAD.'
 if id in ['laser','wst-laser-old']:
  instrument(s,32,75,335,'module');dimension='32 W × 75 H × 335 D mm (body envelope from Keysight datasheet; details approximate)';review='Generated 81940A family reference from Keysight datasheet photograph and 81940A body dimensions. Front details, vents, latch and connector offsets are approximate. Not vendor CAD.';e['cadSource']=source819
 elif id in ['detector','wst-sensor-old']:instrument(s,32,75,130,'module');review='Generated optical sensor module silhouette. Body depth, port and latch positions are estimated; actual 81634B CAD not located.'
 elif id=='wst-mainframe-manual':reference_cad.mainframe_8163b(s);dimension='213 W × 88 H × 380 D mm (body; details approximate)';e['cadSource']=source8163;review='Generated 8163B shell with two open bays for 81940A and 81634B. Published outer dimensions; slot offsets, wall thickness and panel details illustrative. Verify installed order against a bench photo.'
 elif id=='wst-stage-manual':stage(s);review='Concept only: separate DUT motion stage remains unidentified. Estimated stacked XYZ geometry; MAX313D is NOT assigned to this record.'
 elif id in ['camera','wst-camera-manual']:camera(s);review='Provisional camera and stand silhouette. GT Vision USB/display supplier category confirmed; exact camera and objective unknown.'
 elif id in ['fibre','wst-fibre-arms-manual']:arm(s);review='Provisional arm silhouette only. Original unassembled parts are preserved in references/fibre-arm/parts. Await the user’s complete SolidWorks/STEP assembly; no mates or dimensions inferred.'
 elif id=='wst-wafer-holder-manual':holder(s);review='Concept wafer holder and illustrative wafer. Diameter, thickness and printed design estimated; actual holder CAD pending.'
 elif id=='wst-chip-holder-manual':holder(s,True);review='Concept copper block and DUT. Dimensions and retention method pending.'
 elif id=='wst-fibre-pm5-manual':cable(s);review='Coiled cable presentation reference only. Nominal product length 5 m; routed geometry is shortened for display, not dimensional CAD.'
 elif id=='optical-bench-reference':bench(s);dimension='1800 × 900 × 700 mm suggested bench envelope';review='Suggested bench only; actual table size, hole pitch and working height are unconfirmed.'
 elif id=='wst-power-head-new':s.rod('black optical head',(0,0,0),(0,55,0),28);s.rod('silver optical port',(0,28,-26),(0,28,-42),8);review='8162-C is a product family. Head variant remains to select; conceptual head geometry and dimensions are provisional.'
 elif id=='wst-head-interface-new':instrument(s,213,44,300);review='Generated N7749C enclosure reference. Dimensions, channel options and connector placement estimated.'
 elif id=='wst-laser-new':instrument(s,213,88,380);review='Generated N7776C benchtop reference. Enclosure dimensions, front-panel layout and options estimated; vendor STEP not located.'
 elif id=='wst-power-supply':instrument(s,212.6,88.5,348.3);dimension='212.6 W × 88.5 H × 348.3 D mm body (published; front detail approximate)';e['cadSource']='https://www.keysight.com/us/en/assets/9018-01165/user-manuals/9018-01165.pdf';review='Generated E3640A reference with published enclosure dimensions. Controls and ports approximate.'
 elif id=='wafer':instrument(s,650,300,500);review='Generic wafer-test platform concept. Does not depict or identify the actual ficonTEC system; platform CAD needed.'
 else:instrument(s,210,90,300)
 folder=LIB/'references'/id;folder.mkdir(parents=True,exist_ok=True);filename=id+'-Reference.step';s.save(folder/filename)
 e.update(stepPath='library/references/'+id+'/'+filename,model3d='library/models/'+id+'.glb',cadKind='Illustrative reference',cadReview=review)
 if not e.get('dimensions'):e['dimensions']=dimension
 e['cadSource']=e.get('cadSource') or e.get('url') or 'Local bespoke design · user description; complete CAD pending'
 provenance={'equipmentId':id,'kind':e['cadKind'],'generatedAt':'2026-10-07','source':e['cadSource'],'review':review,'units':'millimetres','method':'Closed planar faceted BREP; all feature detail approximate','license':'Generated project geometry. Supplier-linked documents retain supplier rights; confirm redistribution before publishing.'}
 (folder/'provenance.json').write_text(json.dumps(provenance,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
for e in items:
 e['stepSha256']=hashlib.sha256((ROOT/'public'/e['stepPath']).read_bytes()).hexdigest()
 e['modelReference']='STEP: '+e['stepPath']+'\nGLB: '+e['model3d']+'\n'+e['cadReview']+'\n'+e.get('modelReference','') if 'STEP: '+e['stepPath'] not in e.get('modelReference','') else e['modelReference']
(LIB/'equipment.json').write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('Prepared',len(items),'equipment records. Convert generated STEP files with convert-step.mjs before use.')
