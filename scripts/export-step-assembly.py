"""Export source BREP geometry as named components in an AP214 assembly.
Input manifest is prepared/validated by the localhost API. No native feature
history or mechanical constraints are invented. Run with requirements-cad.txt.
"""
import json, sys, math, zipfile, hashlib
from pathlib import Path

root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.local/cad-python'))
from OCP.STEPControl import STEPControl_Reader, STEPControl_AsIs
from OCP.STEPCAFControl import STEPCAFControl_Writer
from OCP.IFSelect import IFSelect_RetDone
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString
from OCP.TDataStd import TDataStd_Name
from OCP.XCAFDoc import XCAFDoc_DocumentTool
from OCP.gp import gp_Trsf
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS_Compound
from OCP.BRep import BRep_Builder
from OCP.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCP.gp import gp_Pnt
from OCP.Interface import Interface_Static

def name(label,text):
    TDataStd_Name.Set_s(label,TCollection_ExtendedString(text))

def transform(q,t):
    x,y,z,w=q
    matrix=[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),t[0],
            2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),t[1],
            2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y),t[2]]
    trsf=gp_Trsf();trsf.SetValues(*matrix);return trsf

def export(manifest,output):
    document=TDocStd_Document(TCollection_ExtendedString('BinXCAF'))
    tool=XCAFDoc_DocumentTool.ShapeTool_s(document.Main())
    compound=TopoDS_Compound();BRep_Builder().MakeCompound(compound)
    assembly=tool.AddShape(compound,True);name(assembly,manifest['name'])
    cache={}
    for component in manifest['components']:
        source=(root/'public'/component['stepPath']).resolve()
        references=(root/'public/library/references').resolve()
        if not source.is_relative_to(references):raise ValueError('CAD source must stay inside library references')
        actual=hashlib.sha256(source.read_bytes()).hexdigest()
        if actual!=component['sourceSha256']:raise ValueError('CAD source changed during export')
        if source not in cache:
            reader=STEPControl_Reader()
            if reader.ReadFile(str(source))!=IFSelect_RetDone:raise ValueError('Cannot read '+component['stepPath'])
            reader.TransferRoots();shape=reader.OneShape()
            if shape.IsNull():raise ValueError('Empty source '+component['stepPath'])
            # Treat each equipment instance as one assembly component. Supplied
            # multi-body/source subassemblies remain complete compound geometry.
            cache[source]=tool.AddShape(shape,False)
            name(cache[source],component['equipmentId'])
        location=TopLoc_Location(transform(component['quaternion'],component['translationMm']))
        instance=tool.AddComponent(assembly,cache[source],location)
        name(instance,component['id']+' | '+component['label'])
    if manifest['includeBench']:
        table=TopoDS_Compound();builder=BRep_Builder();builder.MakeCompound(table)
        builder.Add(table,BRepPrimAPI_MakeBox(gp_Pnt(-900,-80,-450),1800,80,900).Shape())
        for x in [-650,650]:
            for z in [-300,300]:builder.Add(table,BRepPrimAPI_MakeBox(gp_Pnt(x-35,-580,z-35),70,500,70).Shape())
        bench=tool.AddShape(table,False);name(bench,'Illustrative 1800 x 900 mm bench; no hole CAD')
        tool.AddComponent(assembly,bench,TopLoc_Location())
    tool.UpdateAssemblies()
    Interface_Static.SetCVal_s('write.step.schema','AP214IS')
    writer=STEPCAFControl_Writer();writer.SetNameMode(True)
    if not writer.Transfer(document,STEPControl_AsIs):raise ValueError('STEP assembly transfer failed')
    if writer.Write(str(output))!=IFSelect_RetDone:raise ValueError('STEP assembly write failed')
    # Independently reread the exchange file before offering a download.
    check=STEPControl_Reader()
    if check.ReadFile(str(output))!=IFSelect_RetDone:raise ValueError('Exported STEP cannot be read')
    check.TransferRoots()
    if check.OneShape().IsNull():raise ValueError('Exported STEP is empty')

if __name__=='__main__':
    manifest_file=Path(sys.argv[1]);package=Path(sys.argv[2])
    manifest=json.loads(manifest_file.read_text(encoding='utf-8'))
    step=package.with_suffix('.step');export(manifest,step)
    with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED) as archive:
        archive.write(step,'setup.step')
        archive.writestr('placement-manifest.json',json.dumps({k:v for k,v in manifest.items() if k!='setup'},indent=2))
        archive.writestr('editable-setup.json',json.dumps(manifest['setup'],indent=2))
        archive.write(root/'public/documents/SOLIDWORKS-HANDOFF.md','SOLIDWORKS-HANDOFF.md')
    print(json.dumps({'components':len(manifest['components']),'bytes':package.stat().st_size}))
