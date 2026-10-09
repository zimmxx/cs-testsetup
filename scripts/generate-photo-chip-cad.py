"""Generate provisional silhouettes for the photo-derived chip bench.
Only creates missing source files; never replaces later user/vendor CAD.
Dimensions are illustrative millimetres, not photogrammetric measurements.
"""
from pathlib import Path
import importlib.util

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('reference_cad', root / 'scripts/generate-reference-cad.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

def geometry(kind):
    s = module.Step()
    if kind == 'chip-dut-translation-stage-v1':
        s.box('black base',150,18,290,-75,0,-145)
        for x in [-57,57]: s.rod('silver guide rail',(x,26,-125),(x,26,120),5)
        s.box('black carriage',116,35,120,-58,25,-75)
        s.box('silver DUT mounting deck',100,15,95,-50,60,-80)
        for x in [-32,32]: s.rod('silver differential drive',(x,35,112),(x,35,165),8)
        s.rod('silver side micrometer',(55,58,-20),(95,58,-20),8)
    elif kind == 'chip-microscope-body-v1':
        s.box('black support foot',110,15,95,-200,0,-47)
        s.rod('silver support post',(-145,15,0),(-145,350,0),15)
        s.box('black focus carriage',130,72,70,-155,180,-35)
        s.rod('black microscope tube',(0,175,0),(0,350,0),24)
        s.rod('black lower tube',(0,60,0),(0,175,0),18)
        s.rod('black objective',(0,0,0),(0,60,0),12)
        s.rod('silver focus screw',(-95,162,45),(-95,265,45),5)
        s.rod('black focus knob',(-175,216,0),(-195,216,0),18)
    elif kind == 'chip-camera-head-v1':
        s.box('black camera housing',60,95,58,-30,18,-29)
        s.rod('black lens mount',(0,0,0),(0,18,0),19)
        s.rod('silver top connector',(0,113,0),(0,131,0),6)
    elif kind == 'chip-display-monitor-v1':
        s.box('black display frame',420,260,22,-210,80,-11)
        s.box('screen glass',390,228,2,-195,96,-14)
        s.box('black stand neck',35,80,30,-17.5,5,-5)
        s.box('black monitor foot',180,7,105,-90,0,-52.5)
    elif kind == 'chip-led-illuminator-v1':
        s.box('blue illuminator enclosure',120,125,100,-60,0,-50)
        s.rod('silver optical fitting',(0,65,-50),(0,65,-82),20)
        s.rod('black fitting aperture',(0,65,-82),(0,65,-84),9)
        s.rod('black intensity knob',(35,40,-50),(35,40,-65),10)
    elif kind == 'chip-illumination-controller-v1':
        s.box('silver controller enclosure',270,80,200,-135,0,-100)
        s.box('black display',85,27,2,-108,35,-103)
        for x in [25,80]: s.rod('silver control knob',(x,35,-100),(x,35,-115),10)
        for x in range(-112,110,18): s.box('black ventilation',5,20,1,x,52,101)
    elif kind == 'chip-handheld-power-meter-v1':
        s.box('orange handheld case',90,28,170,-45,0,-85)
        s.box('black faceplate',80,3,158,-40,28,-79)
        s.box('screen glass',62,1,57,-31,32,-58)
        for x in [-22,0,22]: s.box('black control button',12,4,12,x-6,32,20)
    elif kind == 'chip-overhead-shelf-v1':
        s.box('silver shelf',1400,24,300,-700,560,-150)
        for x in [-650,650]: s.rod('silver shelf post',(x,0,0),(x,560,0),18)
    else: raise ValueError(kind)
    return s

if __name__ == '__main__':
    for kind in ['chip-dut-translation-stage-v1','chip-microscope-body-v1','chip-camera-head-v1','chip-display-monitor-v1','chip-led-illuminator-v1','chip-illumination-controller-v1','chip-handheld-power-meter-v1','chip-overhead-shelf-v1']:
        directory = root / 'public/library/references' / kind
        directory.mkdir(parents=True, exist_ok=True)
        target = directory / f'{kind}-Reference.step'
        if target.exists():
            print('Preserved existing CAD:', kind)
            continue
        geometry(kind).save(target)
        print('Created illustrative CAD:', kind)
