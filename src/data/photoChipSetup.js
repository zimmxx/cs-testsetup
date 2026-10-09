// Photo-derived draft. Equipment identities and cable routes require lab review.
const sourceFolder='library/references/optical-chip-testing-v1';
export const chipPhotoFiles=[1,2,3].map(i=>`${sourceFolder}/Photo-${i}.jpg`);
const observed=(id,name,model,category,role,photo,description)=>({
  id,name,model,category,role,location:'Lab 2077 · Setup 3 (photo labels)',status:'Needs verification',
  specs:[['Observed in photo',description],['Exact model / dimensions','Not established from photos'],['Evidence status','Observed hardware; provisional identification']],
  url:'',alternatives:'Confirm the installed component before substituting or assigning vendor specifications.',
  note:'User-supplied bench photos. Illustrative geometry and estimated placement only; no calibration or operating limits confirmed.',
  image:`library/images/optical-chip-v1-photo-${photo}.jpg`,imageCredit:'User-supplied CORNERSTONE bench photograph',imageKind:'Lab context photo',
  imageReview:`${description} Full bench photo; surrounding equipment is included. Exact part number and geometry remain to confirm.`,
  imageSourcePath:`${sourceFolder}/Photo-${photo}.jpg`,imageSourceLabel:`Original bench photo ${photo}`,imageRetrievedAt:'2026-10-09',
  imageRights:'User-supplied laboratory photograph; no open licence asserted.',
  cadKind:'Illustrative reference',cadSource:'User photographs; procedural reference geometry',
  cadReview:'Estimated silhouette and dimensions from photographs, not vendor CAD or a measured assembly. Replace with verified STEP/GLB when available.',
  stepPath:`library/references/${id}/${id}-Reference.step`,model3d:`library/models/${id}.glb`,
});
export const photoChipEquipment=[
  observed('chip-dut-translation-stage-v1','Chip DUT translation stage','Manual multi-axis stage · model unconfirmed','Positioning','Moves the chip sample holder independently of the two fibre-arm stages.',3,'Long black translation assembly at the front, with micrometers and a copper holder at its rear.'),
  observed('chip-microscope-body-v1','Chip alignment microscope assembly','Microscope / objective / focus mount · models unconfirmed','Imaging','Observe the chip and fibre tips from above; focus and optical geometry to confirm.',3,'Vertical microscope tube, objective, focus carriage and support post over the chip.'),
  observed('chip-camera-head-v1','Microscope camera head','Black camera head · model unconfirmed','Imaging','Capture the microscope image; interface and output cable to confirm.',3,'Black camera housing above the vertical microscope tube; exact label is unreadable.'),
  observed('chip-display-monitor-v1','Alignment display monitor','Cello display · model unconfirmed','Display','Display the alignment camera image; actual input and routing to confirm.',2,'Large Cello monitor on the overhead shelf.'),
  observed('chip-led-illuminator-v1','Microscope LED illuminator','Microscope LED illuminator · model unconfirmed','Illumination','Provide visible alignment illumination; do not classify as the measurement laser.',3,'Blue unit labelled Microscope LED Illuminator on the top shelf, with a front optical fitting.'),
  observed('chip-illumination-controller-v1','Shelf illumination / instrument controller','Hamamatsu Photonics-labelled unit · function unconfirmed','Control','Shelf support instrument; function and relationship to illumination must be checked.',3,'Cream Hamamatsu Photonics-labelled instrument beneath/next to the blue illuminator.'),
  observed('chip-handheld-power-meter-v1','Handheld meter on chip bench','Orange/black handheld meter · model/function unconfirmed','Accessory','Bench accessory; confirm whether it is an optical power meter and whether it is used in this measurement.',2,'Orange and black handheld instrument on the right of the table; no connected measurement head can be established.'),
  observed('chip-overhead-shelf-v1','Chip bench overhead shelf','Bench shelf / gantry · dimensions unconfirmed','Mechanical support','Support the monitor and shelf instruments above the optical table.',2,'Horizontal shelf supported by two tall posts over the bench.'),
];

const node=(id,equipmentId,label,x,y,bx,bz,height=0,rotation=0,configuration={})=>({id,equipmentId,label,x,y,signalX:x,signalY:y,benchXMm:bx,benchZMm:bz,elevationMm:height,rotationDeg:rotation,
  configuration:{serial:'',calibration:'',dimensions:'Estimated placement only; measure before mechanical use',photoReference:chipPhotoFiles[2],notes:'Photo-derived draft · verify installed hardware and placement.',...configuration}});
const path=(id,from,to,type,notes)=>({id,from,to,type,fromPort:type==='optical'?'Output · confirm':'Output / interface · confirm',toPort:type==='optical'?'Input · confirm':'Input / interface · confirm',fibre:type==='optical'?'unspecified':'',customFibre:'',fromConnector:'Unspecified',toConnector:'Unspecified',length:'',notes:`PROPOSED ROUTE — not traced or verified from photographs. ${notes}`});
export function upgradePhotoChipSetup(setup){
  if(setup?.id!=='optical-chip-testing-v1'||setup.chipHolderRevision>=1)return setup;
  const holder=setup.nodes?.find(n=>n.id==='photo-holder');
  if(holder?.equipmentId!=='wst-chip-holder-manual')return {...setup,chipHolderRevision:1};
  const confirmation='User confirmed the vacuum chip sample stage for this setup on 9 October 2026. Separate holder mounted on the DUT translation stage; vacuum connection, pressure and chip retention procedure require confirmation.';
  const nodes=setup.nodes.map(n=>{
    if(n!==holder)return n;
    const configuration={...n.configuration};
    for(const [key,oldPrefix] of [['cadReference','library/references/wst-chip-holder-manual/'],['modelReference','library/models/wst-chip-holder-manual.glb']])if(configuration[key]?.startsWith(oldPrefix))delete configuration[key];
    configuration.notes=configuration.notes==='Copper block is visible at the centre. Chip identity, retention, heating/vacuum and grating/edge coupling are unconfirmed.'?confirmation:`${configuration.notes||''}${configuration.notes?'\n':''}${confirmation}`;
    return {...n,equipmentId:'chip-vacuum-stage',label:n.label==='Copper chip holder / DUT'?'Vacuum chip sample stage / DUT':n.label,configuration};
  });
  const measurement=setup.measurement?.holder==='Copper chip holder · photo-observed'?{...setup.measurement,holder:'Vacuum chip sample stage · user-confirmed'}:setup.measurement;
  const publication=setup.publication?.description?.includes('two fibre arms, copper chip holder and overhead imaging')?{...setup.publication,description:setup.publication.description.replace('two fibre arms, copper chip holder and overhead imaging','two fibre arms, vacuum chip sample stage and overhead imaging')}:setup.publication;
  return {...setup,nodes,measurement,publication,chipHolderRevision:1};
}
export function createPhotoChipSetup(){
  return {version:1,chipHolderRevision:1,id:'optical-chip-testing-v1',name:'optical-chip-testing-v1',recordStatus:'Photo-derived draft · review required',
    photoEvidence:{version:1,files:chipPhotoFiles,guide:'documents/PHOTO-TO-SETUP.md',manifest:`${sourceFolder}/photo-evidence.json`,
      warning:'Hardware is reconstructed from photos. Module identities, optical routes, fibre models/connectors, dimensions and operating settings require confirmation. C-band is a provisional catalog allocation; no approved measurement capability is asserted.'},
    publication:{scale:'Chip',mode:'Optical',bands:['C-band'],lab:'Lab 2077 · Setup 3 (photo labels)',description:'Photo-derived optical chip bench draft with two fibre arms, vacuum chip sample stage and overhead imaging. Review models, signal routes and dimensions before publication.'},
    nodes:[
      node('photo-mainframe','wst-mainframe-manual','Shelf mainframe · provisional 8163B',20,20,-550,-340,550,0,{notes:'Agilent/Keysight-family front panel visible at shelf left. Reused 8163B reference; exact model and installed modules not verified.'}),
      node('photo-laser','wst-laser-old','Laser · provisional 81940A',240,20,-520,-300,550,0,{signalRole:'source',notes:'Existing-library candidate for the optical source; module is not identifiable in these photos. No mainframe slot assignment assumed.'}),
      node('photo-controller','wst-polarisation-manual','Polarisation / routing · confirm',460,20,-510,50,0,0,{signalRole:'through',notes:'Left-hand fibre loops/supports visible. FPC562 is a candidate from the existing library, not a confirmed photo identification.'}),
      node('photo-sensor','wst-sensor-old','Readout sensor · provisional 81634B',680,20,-250,-340,550,0,{signalRole:'detector',notes:'Existing-library candidate; detector module and connector cannot be verified from photos.'}),
      node('photo-input-stage','fibre-arm-stage','Left fibre-arm stage · model to verify',20,130,-180,0,0,90,{notes:'Black Thorlabs-branded positioning stage seen left of the copper block. MAX313D is reused as a candidate only; verify label and drives.'}),
      node('photo-input-arm','wst-fibre-arms-manual','Left fibre arm · provisional input',240,130,-180,0,65,0,{signalRole:'through',mountingStage:'photo-input-stage',notes:'Bespoke silver arm observed. Input/output direction, exact assembly revision, fibre model and tip type need confirmation.'}),
      node('photo-holder','chip-vacuum-stage','Vacuum chip sample stage / DUT',460,130,0,0,75,0,{signalRole:'through',mountingStage:'photo-dut-stage',notes:'User confirmed the vacuum chip sample stage for this setup on 9 October 2026. Separate holder mounted on the DUT translation stage; vacuum connection, pressure and chip retention procedure require confirmation.'}),
      node('photo-output-arm','wst-fibre-arms-manual','Right fibre arm · provisional output',680,130,180,0,65,180,{signalRole:'through',mountingStage:'photo-output-stage',notes:'Silver arm observed opposite the left arm. Signal direction is proposed; confirm tip and actual route.'}),
      node('photo-output-stage','fibre-arm-stage','Right fibre-arm stage · model to verify',20,240,180,0,0,-90,{notes:'Thorlabs-branded multi-axis stage at right. Reused MAX313D model is a candidate, not an established match.'}),
      node('photo-dut-stage','chip-dut-translation-stage-v1','Front DUT translation stage',240,240,0,170,0,0),
      node('photo-microscope','chip-microscope-body-v1','Overhead microscope & objective',460,240,0,-30,110,0),
      node('photo-camera','chip-camera-head-v1','Microscope camera head',680,240,0,-30,460,0,{notes:'Camera is visually above the microscope. Power/video/data interface and make/model remain unknown.'}),
      node('photo-display','chip-display-monitor-v1','Alignment monitor',20,350,0,-360,620,0),
      node('photo-led','chip-led-illuminator-v1','Shelf LED illuminator',240,350,370,-330,620,0),
      node('photo-illumination-control','chip-illumination-controller-v1','Shelf controller · function to confirm',460,350,370,-330,550,0),
      node('photo-handheld','chip-handheld-power-meter-v1','Handheld bench meter · unconnected',680,350,540,220,0,-15),
      node('photo-shelf','chip-overhead-shelf-v1','Overhead shelf & support posts',20,460,0,-340,0,0),
    ],
    connections:[
      path('PHOTO-O1','photo-laser','photo-controller','optical','Proposed source-to-polarisation lead. Cable part number, connector ends, sleeves and actual source unknown.'),
      path('PHOTO-O2','photo-controller','photo-input-arm','optical','Proposed input fibre path. Do not infer fibre type, length or connector polish from colour.'),
      {...path('PHOTO-GC-IN','photo-input-arm','photo-holder','optical','Candidate above-chip coupling. Confirm grating vs edge coupling and angle.'),fibre:'custom',customFibre:'Candidate free-space coupling · confirm',fromConnector:'Bare fibre',toConnector:'Other'},
      {...path('PHOTO-GC-OUT','photo-holder','photo-output-arm','optical','Candidate output coupling. Confirm fibre tip and direction.'),fibre:'custom',customFibre:'Candidate free-space coupling · confirm',fromConnector:'Other',toConnector:'Bare fibre'},
      path('PHOTO-O3','photo-output-arm','photo-sensor','optical','Proposed return to mainframe sensor. No complete return cable is traceable.'),
      path('PHOTO-VIDEO','photo-camera','photo-display','electrical','Candidate camera-to-monitor observation link; interface and intervening controller unknown. This is not the optical measurement signal.'),
    ],
    measurement:{lab:'Lab 2077 · Setup 3',laserPowerMw:'',inputAngle:'',outputAngle:'',coupling:'',startNm:'',stopNm:'',maxPowerMw:'',notes:'Configure the actual optical band, source/sensor models, fibre routing, coupling, power, scan, calibration and approved limits. Do not inherit the manual wafer bench 10 mW / 10° defaults from photographs.',holder:'Vacuum chip sample stage · user-confirmed',stageModel:'Manual DUT translation stage · model unknown',inputFibreStageModel:'MAX313D candidate · verify',outputFibreStageModel:'MAX313D candidate · verify',cameraModel:'Camera and microscope models unknown'},
    procedure:[
      {title:'Review photo reconstruction',text:'Confirm component labels, left/right input/output direction and the proposed optical path against the real bench. Replace provisional module and stage identities.'},
      {title:'Record hardware and operating limits',text:'Complete serials, calibration, fibre/connector ends, actual cut lengths, coupling type and angles. Enter the approved wavelength and DUT power limits; photos do not supply them.'},
      {title:'Configure the actual chip measurement',text:'Enter chip/device IDs, reference structures, scan and detector settings, data naming and approved local SOP. Verify camera/illumination links separately from the measurement signal.'},
      {title:'Align and acquire under the approved SOP',text:'Use the reviewed lab procedure for loading, alignment, reference acquisition, measurements and acceptance checks. This working outline does not approve hardware operation.'},
      {title:'Retain results and review the setup',text:'Save raw/reference data and configuration; record post-processing and measured timings. Save the editable setup, then explicitly publish a reviewed snapshot if appropriate.'},
    ],
  };
}
const template=createPhotoChipSetup();
export const photoChipCatalogEntry={id:template.id,name:template.name,subtitle:'Photo-derived draft · Setup 3',scale:'Chip',mode:'Optical',bands:['C-band'],status:'Needs verification',lab:template.publication.lab,description:template.publication.description,
  equipment:[...new Set(template.nodes.map(n=>n.equipmentId))],kind:'optical',photos:chipPhotoFiles.map(p=>`../${p}`),photoSource:'User-supplied bench photos · exact hardware and routes require review',source:'photo-chip',guide:'optical',
  capabilities:['Editable photo-derived equipment arrangement','Two opposing fibre arms and separate DUT stage','Overhead microscope and display','Provisional C-band allocation · verify the installed source'],note:template.photoEvidence.warning,template};
