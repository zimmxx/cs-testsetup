// Teaching mechanics/optics only. No device API, calibrated power or collision solver.
export const SIM_VERSION=1;
export const axes=['x','y','z'];
// All stage labels: X lateral, Y along the bench, Z vertical.
export const worldMotion=motion=>({...motion,y:motion.z,z:motion.y});
export const blankMotion=()=>({x:0,y:0,z:0,angle:10,yaw:0});
export const initialSimulation=()=>({motion:{input:{...blankMotion(),x:14,z:-9,y:4},output:{...blankMotion(),x:-12,z:8,y:3},dut:blankMotion()},laserOn:false,powerMw:1,paddles:[0,0,0],operator:true,photons:true,animate:true,wavelengthNm:1550,exaggeration:600,pitch:50,targetAngle:10});
export function identifySimulation(setup,catalog){
 const item=n=>catalog.find(e=>e.id===n?.equipmentId),nodes=setup.nodes||[];
 const arms=nodes.filter(n=>['wst-fibre-arms-manual','fibre'].includes(n.equipmentId));
 const input=arms.find(n=>/input|left/i.test(n.id+' '+n.label))||arms[0];
 const output=arms.find(n=>n!==input&&/output|right/i.test(n.id+' '+n.label))||arms.find(n=>n!==input);
 const dut=nodes.find(n=>['wst-wafer-holder-manual','wst-chip-holder-manual','chip-vacuum-stage','wafer-carrier-2'].includes(n.equipmentId));
 const stage=n=>nodes.find(p=>p.id===(n?.configuration?.mountingStage||n?.configuration?.mount?.parentId));
 const sources=nodes.filter(n=>n.configuration?.signalRole==='source'||item(n)?.category==='Optical source');
 const active=sources.filter(n=>setup.connections.some(c=>c.type==='optical'&&c.from===n.id));
 return {input:input?.id,output:output?.id,dut:dut?.id,inputStage:stage(input)?.id,outputStage:stage(output)?.id,dutStage:stage(dut)?.id,sources,sourceId:active[0]?.id||'',supported:Boolean(input&&output&&dut&&active.length)};
}
export const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
export function perfectFibreAlignment(state){
 const next=structuredClone(state),d=state.motion.dut,theta=d.yaw*Math.PI/180;
 for(const side of ['input','output']){
  const sign=side==='input'?-1:1;
  const pose={...next.motion[side],x:d.x+sign*125*Math.sin(theta),y:d.y+sign*125*(Math.cos(theta)-1),z:d.z,angle:state.targetAngle};
  if(axes.some(axis=>Math.abs(pose[axis])>2000))throw Error('Move the sample away from the ±2 mm travel limit before applying perfect alignment.');
  next.motion[side]=pose;
 }
 return next;
}
export function turnDisplacement(value,degrees,pitch,limit){return clamp(value+degrees*pitch/360,-limit,limit);}
// Ideal quarter/half/quarter waveplates, not a wavelength-calibrated FPC model.
export function polarizationTE(paddles){
 let v=[[1,0],[0,0]];
 for(let i=0;i<3;i++){
  const theta=paddles[i]*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta),d=(i===1?Math.PI:Math.PI/2)/2;
  const u=[[c*v[0][0]+s*v[1][0],c*v[0][1]+s*v[1][1]],[-s*v[0][0]+c*v[1][0],-s*v[0][1]+c*v[1][1]]];
  const phase=(a,p)=>[a[0]*Math.cos(p)-a[1]*Math.sin(p),a[0]*Math.sin(p)+a[1]*Math.cos(p)];
  const a=phase(u[0],-d),b=phase(u[1],d);v=[[c*a[0]-s*b[0],c*a[1]-s*b[1]],[s*a[0]+c*b[0],s*a[1]+c*b[1]]];
 }
 return clamp(v[0][0]**2+v[0][1]**2,0,1);
}
export function coupling(state,side){
 const a=worldMotion(state.motion[side],side),d=worldMotion(state.motion.dut,'dut'),sign=side==='input'?-1:1,theta=d.yaw*Math.PI/180;
 const dx=a.x-d.x-sign*125*Math.sin(theta),dz=a.z-d.z-sign*125*(Math.cos(theta)-1),dy=a.y-d.y;
 return Math.exp(-((dx/5)**2+(dz/7)**2+(dy/12)**2+((a.angle-state.targetAngle)/3)**2));
}
export function opticalSimulation(setup,model,state,sourceId){
 const input=coupling(state,'input'),output=coupling(state,'output'),pol=polarizationTE(state.paddles),efficiency=input*output*pol*.7;
 const powers={},visited=new Map();
 if(state.laserOn&&model.sources.some(n=>n.id===sourceId)&&state.powerMw>0){
  const queue=[[sourceId,state.powerMw]];
  for(let i=0;i<queue.length&&i<500;i++){
   const [id,power]=queue[i];if(visited.has(id)&&visited.get(id)>=power-1e-12)continue;visited.set(id,power);
   for(const e of setup.connections.filter(e=>e.type==='optical'&&e.from===id)){
    let next=power;if(e.to===model.dut)next*=input*pol;if(e.from===model.dut)next*=.7;if(e.to===model.output)next*=output;
    powers[e.id]=Math.max(powers[e.id]||0,next);if(!visited.has(e.to)||next>visited.get(e.to)+1e-12)queue.push([e.to,next]);
   }
  }
 }
 // Report only power that actually reaches a detector through the recorded graph.
 const detectors=setup.nodes.filter(n=>n.configuration?.signalRole==='detector'||/sensor|detector|head/i.test(n.id)&&n.id!==model.sourceId);
 const detectorMw=detectors.reduce((max,n)=>Math.max(max,visited.get(n.id)||0),0);
 return {input,output,pol,efficiency,powers,detectorMw,inputMw:visited.get(model.input)||0,dutMw:visited.get(model.dut)||0,outputMw:visited.get(model.output)||0,lit:Object.keys(powers).filter(id=>powers[id]>1e-9)};
}
export const demoSteps=['Prepare the bench','Launch teaching light','Coarse input alignment','Fine input alignment','Align the output','Scan across the grating','Laser off · finish'];
const mix=(a,b,t)=>a+(b-a)*clamp(t,0,1);
export function demoFrame(seconds){
 const s=initialSimulation(),t=clamp(seconds,0,32);s.laserOn=t>=3&&t<30;
 const inputT=clamp((t-5)/10,0,1),outputT=clamp((t-16)/7,0,1);
 for(const k of axes){s.motion.input[k]=mix(s.motion.input[k],0,inputT);s.motion.output[k]=mix(s.motion.output[k],0,outputT);}
 if(t>=24&&t<30)s.motion.dut.x=8*Math.sin((t-24)*Math.PI/3);
 const phase=t<3?0:t<5?1:t<10?2:t<16?3:t<24?4:t<30?5:6;
 return {motion:s.motion,laserOn:s.laserOn,phase,action:demoSteps[phase]};
}
export function validateSimulation(data,setupId){
 if(data?.version!==SIM_VERSION||data.setupId!==setupId||!Array.isArray(data.keyframes)||data.keyframes.length>40)throw Error('Use a Simulation_draft v1 file for this setup (maximum 40 poses).');
 const snapshots=[data.settings,...data.keyframes.map(k=>k.settings)];
 for(const s of snapshots){
  if(!s?.motion||typeof s.laserOn!=='boolean')throw Error('Invalid simulation settings.');
  for(const group of ['input','output','dut'])for(const key of [...axes,'angle','yaw']){const v=s.motion[group]?.[key];if(!Number.isFinite(v)||axes.includes(key)&&Math.abs(v)>2000||key==='angle'&&(v<0||v>30)||key==='yaw'&&Math.abs(v)>5)throw Error('Invalid simulated axis or angle.');}
  if(![1310,1550].includes(s.wavelengthNm)||['operator','photons','animate'].some(k=>typeof s[k]!=='boolean'))throw Error('Invalid simulation display settings.');
  if(!Number.isFinite(s.powerMw)||s.powerMw<0||s.powerMw>10||!Number.isFinite(s.pitch)||s.pitch<1||s.pitch>1000||!Number.isFinite(s.targetAngle)||s.targetAngle<0||s.targetAngle>30||!Number.isFinite(s.exaggeration)||s.exaggeration<1||s.exaggeration>1000||!Array.isArray(s.paddles)||s.paddles.length!==3||s.paddles.some(v=>!Number.isFinite(v)||v<0||v>180))throw Error('Invalid simulation parameters.');
 }
 for(const k of data.keyframes)if(typeof k.label!=='string'||k.label.length>120)throw Error('Invalid pose label.');
 return data;
}
export function interpolatePose(a,b,t){const s=structuredClone(a);for(const g of ['input','output','dut'])for(const k of [...axes,'angle','yaw'])s.motion[g][k]=mix(a.motion[g][k],b.motion[g][k],t);s.laserOn=t>=1?b.laserOn:a.laserOn;s.powerMw=mix(a.powerMw,b.powerMw,t);s.paddles=a.paddles.map((v,i)=>mix(v,b.paddles[i],t));return s;}
export function equipmentMotionProfile(item){
 const id=item.id,category=item.category||'';
 if(id==='fibre-arm-stage')return {kind:'Differential XYZ',motion:'Three translations; base stays fixed, arm/carriage moves',evidence:'MAX313D / DRV3 reference; fine 300 µm total, nominal 50 µm/rev, coarse stage 4 mm total. Demo pitch is approximate, not metrology.',interactive:true};
 if(/fibre-arms|^fibre$/.test(id))return {kind:'Adjustable arm',motion:'Follows supporting stage; tip angle set separately',evidence:'User CAD has no spring/fibre or articulated mates; moving handle overlay is schematic.',interactive:true};
 if(/holder|carrier|vacuum|dut-translation|xy-motion|wst-stage/.test(id))return {kind:'DUT support',motion:'Holder translates with the selected DUT carriage; optional teaching yaw',evidence:'Unknown stages use editable demonstration pitch/travel; no model-specific range or rotary stage asserted.',interactive:true};
 if(/polarisation|polarization/.test(id))return {kind:'Polarisation',motion:'Three paddle rotations',evidence:'Ideal QWP/HWP/QWP model; actual retardance depends on fibre, turns and wavelength.',interactive:true};
 if(category==='Optical source')return {kind:'Source',motion:'Stationary; virtual laser output on/off',evidence:'Only connected optical graph edges light. No real device control.',interactive:true};
 return {kind:category||'Reference',motion:'Stationary reference / passive path',evidence:'Display/readout is illustrative. This record has no verified kinematic joint.',interactive:false};
}
