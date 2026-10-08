import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getEquipment } from '../data/catalog.js';
import { localPath } from './UI.jsx';
import { benchPosition } from '../lib/benchLayout.js';
import { equipmentPose, housingFor, isMainframe, frameProfile } from '../lib/mainframeAssembly.js';

const emptySceneItems=[];
function disposeObject(root) {root.traverse(o=>{o.geometry?.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.filter(Boolean).forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose();});m.dispose();});});}
function panelLabel(text,width,height,color='#fff'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='600 70px sans-serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false}));mesh.rotation.y=Math.PI;return mesh;
}
export default function ModelScene({nodes=emptySceneItems,connections=emptySceneItems,onSelect,onSelectEdge,items,focusRequest,highlightedNodeIds=emptySceneItems,highlightedEdgeIds=emptySceneItems,hiddenNodeIds=emptySceneItems}) {
  const host=useRef(null),select=useRef(onSelect),view=useRef(null),sceneActions=useRef(null);select.current=onSelect;
  const selectEdge=useRef(onSelectEdge),style=useRef(null);selectEdge.current=onSelectEdge;style.current={nodes:highlightedNodeIds,edges:highlightedEdgeIds,hidden:hiddenNodeIds};
  const styleKey=JSON.stringify(style.current);
  const [labels,setLabels]=useState(false);
  const [exploded,setExploded]=useState(false);
  const [message,setMessage]=useState('');
  const [loadState,setLoadState]=useState('loading');
  const hasModules=nodes.some(n=>housingFor(n,nodes));
  const visualKey=JSON.stringify(nodes.map(n=>({id:n.id,equipmentId:n.equipmentId,x:n.x,y:n.y,benchXMm:n.benchXMm,benchZMm:n.benchZMm,elevationMm:n.elevationMm,rotationDeg:n.rotationDeg,mountingStage:n.configuration?.mountingStage,mainframeId:n.configuration?.mainframeId,mainframeSlot:n.configuration?.mainframeSlot})));
  const modelKey=JSON.stringify(nodes.map(n=>{const item=items?.find(i=>i.id===n.equipmentId)||getEquipment(n.equipmentId);return [item?.model3d,item?.cadKind];}));
  const pathKey=JSON.stringify(connections.map(c=>[c.id,c.from,c.to,c.type]));
  useEffect(()=>{
    const el=host.current;let renderer,frame,disposed=false;
    setMessage('');
    let remaining=nodes.filter(n=>(items?.find(i=>i.id===n.equipmentId)||getEquipment(n.equipmentId))?.model3d).length,failed=false;
    setLoadState(remaining?'loading':'placeholders');
    const complete=()=>{remaining--;if(!disposed){sceneActions.current?.style();if(remaining===0)setLoadState(failed?'error':'loaded');}};
    try {renderer=new THREE.WebGLRenderer({antialias:true});} catch {setMessage('3D rendering is unavailable in this browser. Use Signal path.');setLoadState('unavailable');return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));el.appendChild(renderer.domElement);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
    renderer.domElement.setAttribute('aria-label','Interactive 3D setup: drag to orbit, scroll to zoom; select equipment below for keyboard access.');
    const scene=new THREE.Scene();scene.background=new THREE.Color('#f1f3f9');
    const single=nodes.length===1;
    const camera=new THREE.PerspectiveCamera(40,1,.05,150);camera.position.set(12,11,15);
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;
    if(single){camera.position.set(2.5,1.8,3);controls.target.set(0,.5,0);controls.minDistance=.8;controls.maxDistance=12;}
    else{controls.minDistance=3;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.49;if(view.current){camera.position.copy(view.current.position);controls.target.copy(view.current.target);}}
    scene.add(new THREE.HemisphereLight(0xffffff,0x6b7190,1.8));const light=new THREE.DirectionalLight(0xffffff,2.2);light.position.set(4,10,6);scene.add(light);
    if(single)scene.add(new THREE.GridHelper(8,16,0xd1d6e6,0xe0e4ef));
    else{
      const table=new THREE.Mesh(new THREE.BoxGeometry(18,.8,9),new THREE.MeshStandardMaterial({color:0xc0c7d4,metalness:.55,roughness:.5}));table.position.y=-.41;scene.add(table);
      const holeGeometry=new THREE.CircleGeometry(.022,8),holeMaterial=new THREE.MeshBasicMaterial({color:0x586273,side:THREE.DoubleSide});
      const holes=new THREE.InstancedMesh(holeGeometry,holeMaterial,71*35),matrix=new THREE.Matrix4();let i=0;
      for(let x=-8.75;x<=8.75;x+=.25)for(let z=-4.25;z<=4.25;z+=.25){matrix.makeRotationX(-Math.PI/2);matrix.setPosition(x,.002,z);holes.setMatrixAt(i++,matrix);}holes.count=i;scene.add(holes);
      for(const x of [-6.5,6.5])for(const z of [-3,3]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.65,.7,5,20),new THREE.MeshStandardMaterial({color:0x586175,roughness:.65}));leg.position.set(x,-3.3,z);scene.add(leg);}
    }
    const roots=[],nameLabels=[],paths=[],helpers=[],loader=new GLTFLoader();
    const applyStyle=()=>{
      const highlighted=new Set(style.current.nodes),edgeIds=new Set(style.current.edges),hidden=new Set(style.current.hidden);
      roots.forEach((root,i)=>{root.visible=!hidden.has(root.userData.nodeId);const helper=helpers[i];if(helper){helper.visible=root.visible&&highlighted.has(root.userData.nodeId);if(helper.visible)helper.update();}});
      paths.forEach(({line,arrow,edge})=>{const visible=!hidden.has(edge.from)&&!hidden.has(edge.to);line.visible=visible;arrow.visible=visible;const isSelected=edgeIds.has(edge.id);line.material.color.set(isSelected?0x2f64d9:edge.type==='optical'?0xe2ad25:0x8060d9);line.material.transparent=true;line.material.opacity=edgeIds.size&&!isSelected?.25:1;line.material.emissive.set(isSelected?0x163874:0x000000);arrow.setColor(line.material.color);arrow.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=line.material.opacity;}});});
    };
    sceneActions.current={style:applyStyle,reset:()=>{camera.position.set(...(single?[2.5,1.8,3]:[12,11,15]));controls.target.set(0,single?.5:0,0);controls.update();},labels:visible=>nameLabels.forEach(l=>{l.visible=visible;}),focus:id=>{const n=nodes.find(n=>n.id===id);if(!n)return;const p=equipmentPose(n,nodes,benchPosition),angle=(p.rotationDeg||0)*Math.PI/180;const large=frameProfile(n)?.model==='8164B',distance=large?(exploded?11:8):(exploded?7.5:5);controls.target.set(p.x,p.y+(large?.8:.5),p.z+(large&&exploded?.3:exploded?-1.3:-.5));camera.position.set(p.x+3*Math.cos(angle)-distance*Math.sin(angle),p.y+(large?4.5:2.7),p.z-3*Math.sin(angle)-distance*Math.cos(angle));controls.update();}};
    const pose=n=>{const p=equipmentPose(n,nodes,benchPosition);if(exploded&&housingFor(n,nodes)){const angle=p.rotationDeg*Math.PI/180;const shift=n.equipmentId==='oband-laser-81606a'?-2.5:1.8;p.x-=shift*Math.sin(angle);p.z-=shift*Math.cos(angle);}return p;};
    // Lead cables out of the front and around the shell, rather than through it.
    const moduleRoute=(n,port,other)=>{
      const housing=housingFor(n,nodes);if(!housing)return [port];
      const origin=benchPosition(housing,nodes),angle=(housing.rotationDeg||0)*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle);
      const local=p=>({x:(p.x-origin.x)*cos-(p.z-origin.z)*sin,z:(p.x-origin.x)*sin+(p.z-origin.z)*cos});
      const profile=frameProfile(housing),a=local(port),b=local(other),clearance=profile.depth/2+.8,front=Math.min(a.z-.4,-clearance),side=(b.x>=0?1:-1)*(profile.width/2+.45);
      const world=(x,z)=>new THREE.Vector3(origin.x+x*cos+z*sin,port.y,origin.z-x*sin+z*cos);
      return [port,world(a.x,front),world(side,front),world(side,Math.max(-clearance,Math.min(profile.depth/2+.4,b.z)))];
    };
    const signalPort=(n,type)=>{
      const p=pose(n),angle=p.rotationDeg*Math.PI/180;
      const z=n.equipmentId==='oband-head-81624b'?(type==='optical'?-.455:.455):0;
      const y=n.equipmentId==='oband-head-81624b'?.28:n.equipmentId==='oband-head-interface'?.22:n.equipmentId==='oband-laser-81606a'?.1:.18;
      return new THREE.Vector3(p.x+z*Math.sin(angle),p.y+y,p.z+z*Math.cos(angle));
    };
    for(const n of nodes) {
      const item=items?.find(i=>i.id===n.equipmentId)||getEquipment(n.equipmentId),group=new THREE.Group(),position=pose(n);group.position.set(single?0:position.x,single?0:position.y,single?0:position.z);group.rotation.y=position.rotationDeg*Math.PI/180;group.userData.nodeId=n.id;scene.add(group);roots.push(group);
      const proxy=new THREE.Mesh(new THREE.BoxGeometry(1.7,.7,1.15),new THREE.MeshStandardMaterial({color:0xc3c9df,wireframe:true}));proxy.position.y=.35;group.add(proxy);const helper=new THREE.BoxHelper(group,0x447ae5);helper.material.depthTest=false;helper.material.transparent=true;helper.material.opacity=.7;helper.visible=false;scene.add(helper);helpers.push(helper);
      let label;
      if(!single){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=88;const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillRect(0,0,512,88);ctx.font='600 25px sans-serif';ctx.textAlign='center';ctx.fillStyle='#41425f';ctx.fillText((n.label||item?.name||'Equipment').slice(0,34),256,34);ctx.font='19px sans-serif';ctx.fillStyle=item?.cadKind==='Vendor CAD'?'#44816b':'#a08043';ctx.fillText(item?.cadKind||'CAD pending',256,65);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false,toneMapped:false}));label.scale.set(3.4,.58,1);label.position.y=.9;label.visible=labels;group.add(label);nameLabels.push(label);}
      if(item?.model3d) loader.load(localPath(item.model3d),gltf=>{
        if(disposed){disposeObject(gltf.scene);return;}
        group.remove(proxy);disposeObject(proxy);
        const model=gltf.scene,box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
        const max=Math.max(size.x,size.y,size.z);if(!Number.isFinite(max)||max===0){disposeObject(model);failed=true;setMessage(`Empty geometry: ${item.name}`);complete();return;}
        const scale=single?1.8/max:item.cadKind?10:1.8/max;
        model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,(!single&&housingFor(n,nodes)?-box.min.z:-center.z)*scale);group.add(model);if(label)label.position.y=size.y*scale+.4;complete();
        if(!single&&item.cadKind==='Illustrative reference'){
          if(housingFor(n,nodes)){const horizontal=n.equipmentId==='oband-laser-81606a',name={'wst-laser-old':'81940A','wst-sensor-old':'81634B','oband-head-interface':'81618A','oband-laser-81606a':'81606A'}[n.equipmentId];const decal=panelLabel(name,horizontal?.6:.24,.07);decal.position.set(0,horizontal?.225:.63,horizontal?.205:.115);group.add(decal);}
          else if(isMainframe(n)){const large=frameProfile(n).model==='8164B',decal=panelLabel(`KEYSIGHT ${frameProfile(n).model}`,large?1.25:.75,.09,'#414755');decal.position.set(large?1.15:.56,large?1.43:.88,large?-2.68:-1.88);group.add(decal);}
        }
        // Open the top cover in the exploded view; STEP remains the full shell.
        if(exploded&&isMainframe(n))model.traverse(o=>{if(/^silver[_ ]removable[_ ]top[_ ]cover/.test(o.name))o.visible=false;});
      },undefined,()=>{failed=true;if(!disposed)setMessage(`Could not load ${item.name}. Check its GLB file in Admin.`);complete();});
    }
    for(const c of connections) {
      const a=nodes.find(n=>n.id===c.from),b=nodes.find(n=>n.id===c.to);if(!a||!b)continue;
      const start=signalPort(a,c.type),end=signalPort(b,c.type);
      const mounted=housingFor(a,nodes)||housingFor(b,nodes);
      const curve=mounted?new THREE.CatmullRomCurve3([...moduleRoute(a,start,end),...moduleRoute(b,end,start).reverse()],false,'centripetal'):new THREE.QuadraticBezierCurve3(start,new THREE.Vector3((start.x+end.x)/2,Math.max(start.y,end.y)+.35,(start.z+end.z)/2),end);
      const line=new THREE.Mesh(new THREE.TubeGeometry(curve,mounted?80:36,.025,6,false),new THREE.MeshStandardMaterial({color:c.type==='optical'?0xe2ad25:0x8060d9}));line.userData.edgeId=c.id;scene.add(line);
      const direction=end.clone().sub(curve.getPoint(.9)).normalize();const arrow=new THREE.ArrowHelper(direction,end,.3,c.type==='optical'?0xe2ad25:0x8060d9,.15,.1);scene.add(arrow);paths.push({line,arrow,edge:c});
    }
    applyStyle();
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
    let start;const down=e=>{start=[e.clientX,e.clientY];};const up=e=>{if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)return;const rect=el.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const targets=selectEdge.current?[...roots.filter(r=>r.visible),...paths.filter(p=>p.line.visible).map(p=>p.line)]:roots.filter(r=>r.visible);const hit=ray.intersectObjects(targets,true)[0];if(hit){let obj=hit.object;while(obj&&!obj.userData.nodeId&&!obj.userData.edgeId)obj=obj.parent;if(obj?.userData.edgeId)selectEdge.current?.(obj.userData.edgeId);else if(obj)select.current?.(obj.userData.nodeId);}};
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);
    const animate=()=>{controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(animate);};animate();
    return ()=>{sceneActions.current=null;if(!single)view.current={position:camera.position.clone(),target:controls.target.clone()};disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();disposeObject(scene);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
  // Only rebuild when geometry, placement or topology changes; editing notes,
  // fibre metadata or measurement settings preserves the current orbit view.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[visualKey,modelKey,pathKey,exploded]);
  useEffect(()=>{sceneActions.current?.style();},[styleKey,visualKey,modelKey,pathKey,exploded]);
  useEffect(()=>{if(focusRequest)sceneActions.current?.focus(focusRequest.id);},[focusRequest,visualKey,exploded]);
  return <div className="model-stage" data-model-status={loadState}><div ref={host} className="model-render"/><div className="model-controls"><button onClick={()=>sceneActions.current?.reset()}>Reset view</button>{nodes.length>1&&<button aria-pressed={labels} onClick={()=>{setLabels(v=>!v);sceneActions.current?.labels(!labels);}}>Equipment labels</button>}{hasModules&&<button aria-pressed={exploded} onClick={()=>setExploded(v=>!v)}>{exploded?'Assemble modules':'Explode modules'}</button>}</div>{message&&<div className="model-message" role="status">{message}</div>}<span className="model-hint">{loadState==='loading'?'Loading model…':'Drag to orbit · scroll to zoom · click equipment to inspect'}</span></div>;
}
