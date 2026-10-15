"""Estimated photo silhouettes, millimetres/Y-up. Never replace existing CAD.
Use the project Python/OpenCascade runtime for the perforated carrier.
These are illustrative STEP references, not vendor or measured models.
"""
from pathlib import Path
import importlib.util, sys, math, json
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('reference',root/'scripts/generate-reference-cad.py')
reference=importlib.util.module_from_spec(spec);spec.loader.exec_module(reference)
def geometry(kind):
    s=reference.Step()
    if kind=='wafer-xy-motion-stage-2':
        for z in [-190,260]:
            s.box('black long rail',900,32,65,-450,0,z-32)
            s.rod('silver guide shaft',(-420,44,z),(420,44,z),7)
            s.rod('silver lead screw',(-410,27,z+20),(430,27,z+20),4)
        for x in [-200,200]:s.box('silver cross rail',30,30,440,x-15,35,-180)
        s.box('black wafer carriage',180,26,240,-90,65,-120)
        s.box('silver carriage clamp',140,10,100,-70,91,-50)
        s.rod('black front handwheel',(300,35,300),(300,35,327),46)
        s.rod('silver transverse drive',(370,35,260),(500,35,260),12)
    elif kind=='wafer-camera-head-2':
        s.box('black camera housing',60,82,58,-30,16,-29)
        s.rod('black lens adapter',(0,0,0),(0,16,0),19)
        for x,y in [(-12,68),(12,68),(0,50),(-12,32),(12,32)]:s.rod('silver camera button',(x,y,-29),(x,y,-32),4)
    elif kind=='wafer-monitor-2':
        s.box('black monitor frame',440,270,24,-220,70,-12)
        s.box('screen panel',412,240,2,-206,85,-15)
        s.box('black support neck',40,70,32,-20,0,-8)
        s.rod('black stand foot',(0,0,0),(0,8,0),85)
    elif kind=='wafer-pc-2':
        s.box('black workstation case',310,85,260,-155,0,-130)
        for x in range(-135,20,14):s.box('dark front grille',5,57,1,x,14,-132)
        s.rod('silver power button',(120,43,-130),(120,43,-134),6)
    elif kind=='wafer-shelf-2':
        s.box('silver shelf deck',1580,24,340,-790,540,-170)
        for x in [-750,750]:s.box('silver extrusion post',40,540,40,x-20,0,-20)
        s.box('silver rear crossbar',1480,30,30,-740,320,-15)
    elif kind=='wafer-keyboard-tray-2':
        s.rod('black tray foot',(0,0,0),(0,12,0),65)
        s.rod('silver tray support',(0,12,0),(0,360,0),16)
        s.box('silver tray border',380,20,280,-190,360,-140)
        s.box('black input surface',360,3,260,-180,380,-130)
    elif kind=='wafer-keyboard-2':
        s.box('black keyboard body',360,14,130,-180,0,-65)
        for row in range(5):
            for col in range(15):s.box('dark key',18,4,16,-169+col*23,14,-55+row*22)
    elif kind=='wafer-digital-indicator-2':
        s.box('black readout case',65,58,28,-32.5,0,-14)
        s.box('screen panel',49,30,1,-24.5,22,-16)
        for x in [-17,0,17]:s.rod('copper orange key',(x,11,-14),(x,11,-18),5)
    elif kind=='wafer-shelf-smu-2':
        s.box('silver accessory instrument',215,85,320,-107.5,0,-160)
        s.box('black display bezel',160,27,2,-80,49,-163)
        for x in range(-80,85,23):
            for y in [14,30]:s.box('black instrument key',15,7,2,x,y,-164)
        for x in [55,82]:s.rod('black front terminal',(x,66,-160),(x,66,-170),5)
    elif kind=='wafer-aux-probe-mount-2':
        s.box('black foot',65,12,70,-32.5,0,-35)
        s.box('black vertical carriage',58,84,35,-29,12,-17.5)
        s.rod('black fine adjustment',(0,50,-17.5),(0,50,-38),14)
        s.rod('silver positioning shaft',(-40,80,0),(40,80,0),5)
    else:raise ValueError(kind)
    return s
def carrier(target):
    sys.path.insert(0,str(root/'.local/cad-python'))
    from OCP.gp import gp_Pnt,gp_Dir,gp_Ax2
    from OCP.BRepPrimAPI import BRepPrimAPI_MakeCylinder
    from OCP.BRepAlgoAPI import BRepAlgoAPI_Cut
    from OCP.STEPControl import STEPControl_Writer,STEPControl_AsIs
    from OCP.IFSelect import IFSelect_RetDone
    def cylinder(x,z,r,h,y=0):return BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(x,y,z),gp_Dir(0,1,0)),r,h).Shape()
    shape=cylinder(0,0,115,18)
    # Hole/count/spacing are approximate visible motifs; not manufactured geometry.
    for x,z,r in [(0,0,25)]+[(64*math.cos(i*math.pi/3),64*math.sin(i*math.pi/3),23) for i in range(6)]+[(-110,0,29),(110,0,29)]:
        shape=BRepAlgoAPI_Cut(shape,cylinder(x,z,r,22,-2)).Shape()
    writer=STEPControl_Writer();writer.Transfer(shape,STEPControl_AsIs)
    if writer.Write(str(target))!=IFSelect_RetDone:raise RuntimeError('STEP write failed')
    Path(str(target)+'.parts.json').write_text(json.dumps(['black circular wafer carrier'])+'\n')
if __name__=='__main__':
    kinds=['wafer-xy-motion-stage-2','wafer-carrier-2','wafer-camera-head-2','wafer-monitor-2','wafer-pc-2','wafer-shelf-2','wafer-keyboard-tray-2','wafer-keyboard-2','wafer-digital-indicator-2','wafer-shelf-smu-2','wafer-aux-probe-mount-2']
    for kind in kinds:
        target=root/f'public/library/references/{kind}/{kind}-Reference.step';target.parent.mkdir(parents=True,exist_ok=True)
        if target.exists():print('Preserved',kind);continue
        if kind=='wafer-carrier-2':carrier(target)
        else:geometry(kind).save(target)
        print('Created illustrative reference',kind)
