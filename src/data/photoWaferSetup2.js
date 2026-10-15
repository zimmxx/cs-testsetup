// Photo evidence establishes hardware presence, not instrument options or an SOP.
const folder='library/references/wafer-manual-setup-2';
export const wafer2Photos=[1,2,3,4].map(i=>`${folder}/Photo-${i}.jpg`);
const observed=(id,name,category,role,description,photo=4)=>({
  id,name,model:'Photo-observed assembly · exact model unconfirmed',category,role,
  location:'Bench label SETUP 2 · room to confirm',status:'Needs verification',
  specs:[['Photo evidence',description],['Model / dimensions','Unconfirmed; illustrative dimensions only'],['Operating limits','Not supplied']],
  url:'',alternatives:'Replace with the verified installed model and original CAD when available.',
  note:'Created from user photos received 13 October 2026. Presence observed; identity, calibration and dimensions require review.',
  image:`library/images/wafer-setup-2-photo-${photo}.jpg`,imageCredit:'User-supplied CORNERSTONE bench photograph',imageKind:'Lab context photo',
  imageReview:`${description} Full bench photograph, not an isolated verified product image.`,
  imageSourcePath:wafer2Photos[photo-1],imageSourceLabel:`Original Setup 2 photo ${photo}`,imageRetrievedAt:'2026-10-13',imageRights:'User-supplied lab photo; no open licence asserted.',
  cadKind:'Illustrative reference',cadSource:'Photo-derived procedural geometry',cadReview:'Estimated silhouette, not measured or vendor CAD. Does not establish fit, travel or clearance.',
  stepPath:`library/references/${id}/${id}-Reference.step`,model3d:`library/models/${id}.glb`,
});
export const wafer2Equipment=[
  observed('wafer-xy-motion-stage-2','Setup 2 wafer motion assembly','Positioning','Move the wafer holder independently of both fibre arms.','Large orthogonal rail/lead-screw motion assembly, front handwheel and rear cross rail. Axes, travel and drive model unconfirmed.'),
  observed('wafer-carrier-2','Setup 2 circular wafer carrier','Sample holder','Support the wafer on the separate motion assembly.','Black circular plate with several circular openings and edge cut-outs. Retention/vacuum and wafer diameter unknown.'),
  observed('wafer-camera-head-2','Setup 2 alignment camera head','Imaging','Capture the overhead alignment image; interface unknown.','Black upper camera housing with a small cluster of grey/white control buttons above the microscope.'),
  observed('wafer-monitor-2','Setup 2 alignment / workstation monitor','Display','Show alignment images or acquisition software; input assignment unknown.','Two black flat-panel monitors on the shelf; do not assign the Cello model from Setup 3.',2),
  observed('wafer-pc-2','Setup 2 workstation computer','Computing','Candidate acquisition/observation host; software and instrument interfaces to confirm.','Black small desktop computer below the right monitor, Dell-family mark visible; exact model unreadable.',2),
  observed('wafer-shelf-2','Setup 2 instrument shelf and frame','Mechanical support','Support shelf instruments and displays.','Aluminium extrusion gantry with wide top shelf and lower crossbar. Width/height estimated.',2),
  observed('wafer-keyboard-tray-2','Setup 2 adjustable workstation tray','Mechanical support','Support keyboard and writing/input surface beside the bench.','White-edged sloping black tray on a vertical support at the right.'),
  observed('wafer-keyboard-2','Setup 2 keyboard','Accessory','Workstation input device; connection unconfirmed.','Black keyboard at the upper edge of the right workstation tray.'),
  observed('wafer-digital-indicator-2','Setup 2 digital position indicator','Position readout','Candidate position readout; axis/units and actual function require confirmation.','Small black digital indicator with three orange buttons beside the front wafer motion rail.'),
  observed('wafer-shelf-smu-2','Setup 2 Keithley-labelled shelf instrument','Electrical instrument','Candidate source/measurement accessory; leave disconnected until the red leads are traced.','Keithley brand visible on upper-left shelf instrument. Exact model and function unconfirmed; not automatically the existing 6487.',3),
  observed('wafer-aux-probe-mount-2','Setup 2 auxiliary probe / positioning mount','Positioning','Additional rear bench accessory; active use and probe endpoints unknown.','Black compact upright mounts at the rear-right of the working area. Function and model cannot be established.',4),
];
const node=(id,equipmentId,label,index,bx,bz,height=0,yaw=0,configuration={})=>({
  id,equipmentId,label,x:20+(index%4)*220,y:15+Math.floor(index/4)*80,
  signalX:20+(index%4)*220,signalY:20+Math.floor(index/4)*135,
  benchXMm:bx,benchZMm:bz,elevationMm:height,rotationDeg:yaw,
  configuration:{serial:'',calibration:'',photoReference:wafer2Photos[3],notes:'Photo-derived placement; verify hardware, dimensions and clearance.',...configuration},
});
const edge=(id,from,to,type,notes)=>({id,from,to,type,fromPort:'Interface / port to confirm',toPort:'Interface / port to confirm',
  fibre:type==='optical'?'unspecified':'',customFibre:'',fromConnector:'Unspecified',toConnector:'Unspecified',length:'',
  notes:`PROPOSED ROUTE — endpoints and purpose require lab confirmation. ${notes}`});
export function createPhotoWaferSetup2(){const setup={
  version:1,id:'wafer-manual-setup-2',name:'wafer-manual-setup-2',recordStatus:'Photo-derived draft · review required',
  photoEvidence:{version:1,files:wafer2Photos,guide:'documents/WAFER-MANUAL-SETUP-2.md',manifest:`${folder}/photo-evidence.json`,
    warning:'Setup 2 reconstructed from four photos. User confirmed the same 8163B, 81940A and 81634B measurement instruments as Manual Wafer Optical Measurement; the unused right-hand shelf housing is excluded at their request. Slots 1/2 are provisional display defaults. Stage matches, signal direction, fibres and settings require review. C-band does not confirm the complete path capability. No wafer, spring or fibre geometry is invented.'},
  publication:{scale:'Wafer',mode:'Optical',bands:['C-band'],lab:'SETUP 2 · room to confirm',description:'Manual wafer bench reconstructed from four photos: circular carrier, separate motion rails, opposing fibre arms, overhead imaging and dual-monitor workstation. Unpublished review draft.'},
  nodes:[
    node('w2-mainframe','wst-mainframe-manual','Keysight 8163B measurement mainframe',0,-610,-300,564,180,{mount:{parentId:'w2-shelf',offsetXMm:-610,offsetYMm:564,offsetZMm:40},photoReference:wafer2Photos[2],notes:'User confirmed on 13 October 2026: same measurement instruments as Manual Wafer Optical Measurement (8163B, 81940A, 81634B). Left shelf assignment follows the optical-looking leads. Slots 1/2 are provisional display defaults, not a confirmed physical order.'}),
    node('w2-input-controller','wst-polarisation-manual','Left routing / polarisation A · candidate',1,-650,120,0,0,{notes:'Black paddles and fibre loops at front-left. FPC562 reused provisionally; cable ends and exact paddle assemblies unconfirmed.'}),
    node('w2-input-arm','wst-fibre-arms-manual','Left fibre arm · proposed input',2,-260,-45,125,0,{mountingStage:'w2-input-stage',notes:'Bespoke silver arm above sample region. Existing user try3 CAD is a provisional revision match; spring/fibre omitted. Input direction not confirmed.'}),
    node('w2-holder','wafer-carrier-2','Circular wafer carrier / DUT location',3,0,30,95,0,{mountingStage:'w2-wafer-stage',notes:'Openwork circular carrier is observed; no wafer visibly loaded. Diameter, cut-out layout, retention and vacuum are unknown. Separate from chip vacuum holder.'}),
    node('w2-output-arm','wst-fibre-arms-manual','Right fibre arm · proposed output',4,260,-45,125,180,{mountingStage:'w2-output-stage',notes:'Opposing silver arm; reused try3 model as a candidate. Output direction, tip type and fibre angle remain to confirm.'}),
    node('w2-output-controller','wst-polarisation-manual','Left routing / polarisation B · candidate',5,-650,260,0,0,{notes:'Second front-left paddle/loop assembly. Its position in the proposed return path is inferred; it may serve a different purpose.'}),
    node('w2-input-stage','fibre-arm-stage','Left fibre-arm stage · MAX313D candidate',6,-260,-45,60,90,{notes:'Black micrometer stage below left arm. NanoMax-family silhouette; MAX313D exact drive variant unverified. Bespoke support height estimated.'}),
    node('w2-output-stage','fibre-arm-stage','Right fibre-arm stage · MAX313D candidate',7,260,-45,60,-90,{notes:'Opposing black micrometer stage; same provisional MAX313D reference. Does not move the wafer holder.'}),
    node('w2-wafer-stage','wafer-xy-motion-stage-2','Wafer motion rails & handwheel',8,0,30),
    node('w2-microscope','chip-microscope-body-v1','Overhead microscope / focus assembly · candidate',9,0,-20,135,0,{notes:'Visible tube, focus mount and silver post resemble Setup 3. Existing geometry reused provisionally; objective, focus assembly and post dimensions unverified.'}),
    node('w2-camera','wafer-camera-head-2','Alignment camera head',10,0,-20,485,0,{mount:{parentId:'w2-microscope',offsetXMm:0,offsetYMm:350,offsetZMm:0}}),
    node('w2-left-display','wafer-monitor-2','Left monitor · role to confirm',11,-245,-340,564,180,{mount:{parentId:'w2-shelf',offsetXMm:-245,offsetYMm:564,offsetZMm:0}}),
    node('w2-right-display','wafer-monitor-2','Right monitor · role to confirm',12,220,-340,649,0,{mount:{parentId:'w2-pc',offsetXMm:-20,offsetYMm:85,offsetZMm:10}}),
    node('w2-pc','wafer-pc-2','Workstation PC',13,200,-330,564,180,{mount:{parentId:'w2-shelf',offsetXMm:200,offsetYMm:564,offsetZMm:10}}),
    node('w2-shelf','wafer-shelf-2','Aluminium shelf & gantry',14,0,-340),
    node('w2-shelf-smu','wafer-shelf-smu-2','Keithley-labelled accessory · unconnected',15,-610,-300,660,0,{mount:{parentId:'w2-mainframe',offsetXMm:0,offsetYMm:96,offsetZMm:0},photoReference:wafer2Photos[2],notes:'Brand visible; exact model and red-lead destination not established. No electrical measurement capability or DUT connection assumed.'}),
    node('w2-tray','wafer-keyboard-tray-2','Right workstation tray',17,650,0),
    node('w2-keyboard','wafer-keyboard-2','Keyboard',18,650,-80,383,180,{mount:{parentId:'w2-tray',offsetXMm:0,offsetYMm:383,offsetZMm:-80}}),
    node('w2-indicator','wafer-digital-indicator-2','Digital indicator · axis to confirm',19,180,230),
    node('w2-aux-mount-a','wafer-aux-probe-mount-2','Rear auxiliary mount A · unconnected',20,390,-245),
    node('w2-aux-mount-b','wafer-aux-probe-mount-2','Rear auxiliary mount B · unconnected',21,460,-290),
    node('w2-laser','wst-laser-old','Keysight 81940A tunable laser',22,-610,-300,564,0,{mainframeId:'w2-mainframe',mainframeSlot:'1',signalRole:'source',notes:'User confirmed same source as Manual Wafer Optical Measurement on 13 October 2026. Slot 1 is the existing manual template default; confirm actual slot/order, serial and calibration.'}),
    node('w2-sensor','wst-sensor-old','Keysight 81634B optical power sensor',23,-610,-300,564,0,{mainframeId:'w2-mainframe',mainframeSlot:'2',signalRole:'detector',notes:'User confirmed same sensor as Manual Wafer Optical Measurement on 13 October 2026. Slot 2 is a provisional display default; verify installed slot and port.'}),
  ],
  connections:[
    edge('W2-O1','w2-laser','w2-input-controller','optical','Confirmed 81940A source identity; controller role and actual fibre route still require tracing.'),
    edge('W2-O2','w2-input-controller','w2-input-arm','optical','Candidate controller-to-input-arm route; fibre model, sleeves and connector polish are unknown.'),
    {...edge('W2-IN','w2-input-arm','w2-holder','optical','Candidate above-wafer grating coupling; confirm tip, coupling type and angle.'),fibre:'custom',customFibre:'Free-space coupling candidate',fromConnector:'Bare fibre',toConnector:'Other'},
    {...edge('W2-OUT','w2-holder','w2-output-arm','optical','Candidate output coupling, not proof of input/output assignment.'),fibre:'custom',customFibre:'Free-space coupling candidate',fromConnector:'Other',toConnector:'Bare fibre'},
    edge('W2-O3','w2-output-arm','w2-output-controller','optical','Second controller in return path is only a proposal; confirm whether it belongs to this path.'),
    edge('W2-O4','w2-output-controller','w2-sensor','optical','Candidate return to confirmed 81634B sensor. Controller purpose and return lead need tracing; unused right housing excluded by user.'),
    edge('W2-CAMERA','w2-camera','w2-pc','electrical','Candidate image/data link; direct-to-monitor or intermediate-controller routing is also possible. Not a bias signal.'),
    edge('W2-DISPLAY-L','w2-pc','w2-left-display','electrical','Candidate display link; interface unknown.'),
    edge('W2-DISPLAY-R','w2-pc','w2-right-display','electrical','Candidate second display link; interface unknown.'),
    edge('W2-KEYBOARD','w2-keyboard','w2-pc','electrical','Candidate workstation input cable; no connector type inferred.'),
  ],
  measurement:{lab:'SETUP 2 · room to confirm',laserPowerMw:'',maxPowerMw:'',inputAngle:'',outputAngle:'',coupling:'',startNm:'',stopNm:'',holder:'Circular openwork carrier · model and retention unknown',stageModel:'Separate manual wafer rail assembly · exact axes/model unknown',cameraModel:'Button-control camera head · model unknown',notes:'Core instruments confirmed as 8163B / 81940A / 81634B, matching Manual Wafer Optical Measurement. Slots 1/2 are presentation defaults pending order confirmation. Collect wafer/map, cable endpoints, coupling, approved limits, scan/calibration and timing. Do not copy 10 mW / 10° from another bench.'},
  procedure:[
    {title:'Confirm the photo reconstruction',text:'Check all component IDs, source/detector modules, two controller roles, arm drive variants, wafer holder and motion axes. Trace proposed optical/video paths against the real bench.'},
    {title:'Record wafer and operating parameters',text:'Complete wafer format/map, carrier retention, stage travel and datum, coupling angles, fibre preparation and approved optical limits. Keep electrical accessories disconnected in the record until their purpose is established.'},
    {title:'Prepare and align using the approved SOP',text:'Use the reviewed local procedure for loading/retention, imaging, reference structures and fibre alignment. This draft is a documentation outline, not operating approval.'},
    {title:'Acquire and document sites',text:'Record site coordinates, scan/readout settings, calibration/reference files and repeated measurements under the approved procedure. Retain raw data and configuration.'},
    {title:'Review and save the finished setup',text:'Record shutdown, post-processing, acceptance criteria and measured timings. Save editable JSON locally; explicitly publish only after the hardware/path review.'},
  ],
};
  const flow={'w2-laser':[20,20],'w2-input-controller':[240,20],'w2-input-arm':[460,20],'w2-holder':[680,20],'w2-output-arm':[680,160],'w2-output-controller':[460,160],'w2-sensor':[240,160]};
  let accessory=0;
  setup.nodes=setup.nodes.map(n=>{const [signalX,signalY]=flow[n.id]||[20+(accessory%4)*220,320+Math.floor(accessory++/4)*135];return {...n,signalX,signalY};});
  return setup;
}
const template=createPhotoWaferSetup2();
export const wafer2CatalogEntry={id:template.id,name:template.name,subtitle:'Photo-derived manual wafer bench · Setup 2',scale:'Wafer',mode:'Optical',bands:['C-band'],status:'Needs verification',lab:template.publication.lab,description:template.publication.description,equipment:[...new Set(template.nodes.map(n=>n.equipmentId))],kind:'optical',photos:wafer2Photos.map(p=>`../${p}`),source:'photo-wafer-2',guide:'wafer',photoSource:'User-supplied Setup 2 photos · provisional identities',capabilities:['Editable manual wafer bench reconstruction','Separate wafer holder / motion assembly and two fibre arms','Overhead imaging and dual-monitor workstation','Provisional C-band allocation · verify actual instruments'],note:template.photoEvidence.warning,template};
