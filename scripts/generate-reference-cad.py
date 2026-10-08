from pathlib import Path
import math, json
class Step:
 def __init__(self):self.rows=[];self.solids=[];self.names=[]
 def e(self,s):self.rows.append(f'#{len(self.rows)+1} = {s};');return len(self.rows)
 def p(self,v):return self.e("CARTESIAN_POINT('',("+','.join(f'{x:.9f}' for x in v)+'))')
 def solid(self,name,vertices,faces):
  pts=[self.p(v) for v in vertices];fs=[]
  for face in faces:
   loop=self.e("POLY_LOOP('',("+','.join(f'#{pts[i]}' for i in face)+'))');bound=self.e(f"FACE_OUTER_BOUND('',#{loop},.T.)")
   a,b,c=[vertices[i] for i in face[:3]];u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)];n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
   def direction(v):
    mag=math.sqrt(sum(x*x for x in v));return self.e("DIRECTION('',("+','.join(f'{x/mag:.9f}' for x in v)+'))')
   normal,ref=direction(n),direction(u);axis=self.e(f"AXIS2_PLACEMENT_3D('',#{pts[face[0]]},#{normal},#{ref})");plane=self.e(f"PLANE('',#{axis})")
   fs.append(self.e(f"FACE_SURFACE('',(#{bound}),#{plane},.T.)"))
  shell=self.e("CLOSED_SHELL('',("+','.join(f'#{f}' for f in fs)+'))');self.solids.append(self.e(f"FACETED_BREP('{name}',#{shell})"));self.names.append(name)
 def box(self,name,w,h,d,x=0,y=0,z=0):
  v=[(x+a*w,y+b*h,z+c*d) for a,b,c in [(0,0,0),(1,0,0),(1,1,0),(0,1,0),(0,0,1),(1,0,1),(1,1,1),(0,1,1)]]
  self.solid(name,v,[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]])
 def rod(self,name,a,b,r,sides=20):
  # Closed polygonal cylinder; valid faceted BREP, deliberately illustrative.
  axis=[b[i]-a[i] for i in range(3)];length=math.sqrt(sum(v*v for v in axis));axis=[v/length for v in axis]
  base=[0,1,0] if abs(axis[1])<.9 else [1,0,0]
  u=[axis[1]*base[2]-axis[2]*base[1],axis[2]*base[0]-axis[0]*base[2],axis[0]*base[1]-axis[1]*base[0]];mag=math.sqrt(sum(v*v for v in u));u=[v/mag for v in u];v=[axis[1]*u[2]-axis[2]*u[1],axis[2]*u[0]-axis[0]*u[2],axis[0]*u[1]-axis[1]*u[0]]
  vertices=[tuple(p[j]+r*(u[j]*math.cos(i*2*math.pi/sides)+v[j]*math.sin(i*2*math.pi/sides)) for j in range(3)) for p in [a,b] for i in range(sides)]
  faces=[list(reversed(range(sides))),list(range(sides,2*sides))]+[[i,(i+1)%sides,(i+1)%sides+sides,i+sides] for i in range(sides)]
  self.solid(name,vertices,faces)
 def save(self,p):
  app=self.e("APPLICATION_CONTEXT('configuration controlled 3d designs of mechanical parts and assemblies')")
  self.e(f"APPLICATION_PROTOCOL_DEFINITION('international standard','config_control_design',1994,#{app})")
  pc=self.e(f"PRODUCT_CONTEXT('',#{app},'mechanical')");prod=self.e(f"PRODUCT('REF','Illustrative reference','NOT vendor CAD',(#{pc}))");form=self.e(f"PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('','',#{prod},.NOT_KNOWN.)");dc=self.e(f"PRODUCT_DEFINITION_CONTEXT('part definition',#{app},'design')");pd=self.e(f"PRODUCT_DEFINITION('design','',#{form},#{dc})");shape=self.e(f"PRODUCT_DEFINITION_SHAPE('','',#{pd})")
  u=self.e("(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.))");ang=self.e("(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.))");sa=self.e("(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT())");unc=self.e(f"UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.000001),#{u},'distance_accuracy_value','')");ctx=self.e(f"(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#{unc}))GLOBAL_UNIT_ASSIGNED_CONTEXT((#{u},#{ang},#{sa}))REPRESENTATION_CONTEXT('',''))")
  rep=self.e("FACETED_BREP_SHAPE_REPRESENTATION('Illustrative reference',("+','.join(f'#{s}' for s in self.solids)+f'),#{ctx})');self.e(f'SHAPE_DEFINITION_REPRESENTATION(#{shape},#{rep})')
  Path(p).write_text("ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Illustrative CAD - NOT vendor dimensions'),'2;1');\nFILE_NAME('reference.step','2026-10-07',('CORNERSTONE'),(''),'reference generator','','');\nFILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));\nENDSEC;\nDATA;\n"+'\n'.join(self.rows)+'\nENDSEC;\nEND-ISO-10303-21;\n')
  Path(str(p)+'.parts.json').write_text(json.dumps(self.names,indent=2)+'\n',encoding='utf-8')
def mainframe_8163b(s):
 # Published outer body 213 W x 88 H x 380 D mm. Bay positions,
 # wall thickness, controls and mounting clearance are illustrative.
 # Front faces -Z: negative X is the right side when viewed from the front.
 s.box('silver left electronics enclosure',140,88,380,-33.5,8,-190)
 s.box('silver bottom plate',73,3,380,-106.5,8,-190)
 s.box('silver removable top cover',73,3,380,-106.5,93,-190)
 s.box('silver right wall',3,82,380,-106.5,11,-190)
 s.box('silver rear wall',70,82,8,-103.5,11,182)
 s.box('silver slot divider',2,82,372,-70.5,11,-190)
 s.box('silver left front panel',136,84,3,-31.5,10,-193)
 s.box('black display bezel',80,40,2,16,40,-195)
 s.box('screen glass',69,30,1,21,45,-197)
 for i in range(4):s.box('black control key',12,6,3,14+i*20,21,-197)
 s.rod('silver rotary control',(-14,65,-194),(-14,65,-202),10)
 for x in [-74,74]:
  for z in [-133,133]:s.box('black foot',18,8,18,x-9,0,z-9)

if __name__=='__main__':
 s=Step();s.box('body',32,75,335);s.box('front panel',34,77,3,-1,-1,-3);s.save('.local/cad-tools/test-reference.step')
