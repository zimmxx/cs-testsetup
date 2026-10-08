// Local bench information supplied by the user, 5 October 2026.
import { addBenchDefaults } from '../lib/benchLayout.js';
import { addMainframeDefaults } from '../lib/mainframeAssembly.js';
const item=(id,name,model,category,url,specs=[])=>({id,name,model,category,url,specs,location:'Lab 2077',status:'Needs verification',role:name,alternatives:'',note:'Manual wafer optical bench, user-reported 5 October 2026. Verify installed options and calibration.',image:'',model3d:''});
export const manualEquipment=[
  item('wst-laser-old','Manual bench laser','Keysight 81940A','Optical source','https://www.keysight.com/us/en/product/81940A/compact-tunable-laser-source-continuous-sweep-mode-1520nm-1630nm.html',[['Usual output setting','10 mW (user-reported)']]),
  item('wst-mainframe-manual','Laser & sensor mainframe','Keysight 8163B','Mainframe','https://www.keysight.com/us/en/product/8163B/lightwave-multimeter.html',[['Compact module slots','2'],['Installed modules','81940A tunable laser and 81634B power sensor']]),
  item('wst-sensor-old','Manual bench power sensor','Keysight 81634B','Detection','https://www.keysight.com/us/en/product/81634B/low-polarization-dependence-optical-power-sensor.html'),
  item('wst-polarisation-manual','Polarisation controller','Thorlabs FPC562','Fibre optics','https://www.thorlabs.com/item/FPC562',[['Paddles','3'],['Loop diameter','56 mm']]),
  item('wst-mating-sleeve-manual','Mating sleeve','Thorlabs ADAFCPMB2','Fibre optics','https://www.thorlabs.com/item/ADAFCPMB2'),
  item('wst-fibre-arms-manual','Adjustable fibre arm','Bespoke · University of Southampton','Positioning','',[['Coupling','Grating couplers'],['Usual angle','10° from wafer normal']]),
  item('wst-fibre-pm2-manual','PM patch cable','Thorlabs P3-1550PM-FC-2','Fibre optics','https://www.thorlabs.com/item/P3-1550PM-FC-2',[['Nominal length','2 m'],['Connector reference','FC/APC; inspect actual ends']]),
  item('wst-fibre-sm-manual','Cleaved SM patch cable','Thorlabs P3-SMF28Y-FC-5','Fibre optics','https://www.thorlabs.com/item/P3-SMF28Y-FC-5',[['Nominal uncut length','5 m'],['Reported product range','1260–1625 nm'],['Bench preparation','Cleaved at arm end; actual remaining length unknown']]),
  item('wst-stage-manual','DUT motion stage','Model pending','Positioning','',[['Purpose','Move the wafer/chip DUT; separate from fibre-arm stages']]),
  {...item('fibre-arm-stage','Fibre arm stage','Thorlabs MAX313D','Positioning','https://www.thorlabs.com/item/MAX313D',[['Axes','X / Y / Z'],['Drives','Differential drives'],['Piezos','None'],['Bench quantity','2: input and output fibre arms']]),role:'Position the bespoke fibre arm for optical alignment; one stage on each side of the DUT.',model3d:'library/models/max313d.glb',note:'User confirmed MAX313D for both fibre arms. This does not identify the separate DUT motion stage.'},
  item('wst-camera-manual','Alignment camera','USB / display · exact model pending','Imaging','https://gtvision.co.uk/collections/usb-hdmi-cameras'),
  item('wst-wafer-holder-manual','Wafer holder / DUT','Bespoke · 3D printed','Positioning',''),
  item('wst-chip-holder-manual','Alternative chip holder','Bespoke · copper block','Positioning',''),
];

// Each input is independently editable. Empty values mean not yet supplied.
export const manualGroups=[
  {title:'Session & device',fields:[['lab','Lab / bench'],['operator','Operator'],['date','Measurement date','date'],['waferId','Wafer ID'],['chipId','Chip / die ID'],['deviceId','Device / waveguide ID'],['deviceMap','Device map or coordinates file'],['objective','Measurement objective'],['siteCount','Number of sites','number','count'],['waveguideCount','Waveguides per site','number','count']]},
  {title:'Laser & acquisition',fields:[['laserPowerMw','Laser output setpoint','number','mW'],['startNm','Start wavelength','number','nm'],['stopNm','Stop wavelength','number','nm'],['stepNm','Wavelength step','number','nm'],['fixedNm','Fixed wavelength (if used)','number','nm'],['method','Acquisition method','select',['Manual wavelength points','Continuous sweep','Fixed wavelength']],['sweepSpeed','Sweep speed','number','nm/s'],['dwellMs','Dwell per point','number','ms'],['settleMs','Settling time','number','ms'],['repeats','Repeats per device','number','count'],['laserSlot','Laser mainframe slot'],['instrumentAddress','Instrument address / connection'],['software','Acquisition software / version']]},
  {title:'Detector & reference',fields:[['sensorMainframe','Sensor mainframe'],['sensorSlot','Sensor slot / channel'],['detectorRange','Power range / autorange'],['averagingMs','Detector averaging time','number','ms'],['readoutUnit','Readout unit','select',['dBm','mW','W']],['referenceStructure','Reference structure / path'],['referenceFile','Reference measurement file'],['normalisation','Normalisation method'],['dutPowerMw','Measured power at DUT','number','mW'],['noiseFloor','Measured noise floor / units'],['saturation','Saturation threshold / units']]},
  {title:'Coupling & mounting',fields:[['coupling','Coupling type','select',['Grating couplers','Edge couplers']],['inputAngle','Input angle from wafer normal','number','deg'],['outputAngle','Output angle from wafer normal','number','deg'],['polarisation','Measured polarisation','select',['TE','TM','Both','Unspecified']],['paddleSettings','Paddle angles / reference photo'],['inputCoordinates','Input grating coordinates / axes'],['outputCoordinates','Output grating coordinates / axes'],['gratingPitch','Grating pitch','number','µm'],['holder','Active holder'],['mounting','Mounting / retention method'],['stageModel','DUT motion stage model'],['inputFibreStageModel','Input fibre arm stage model'],['outputFibreStageModel','Output fibre arm stage model'],['cameraModel','Exact camera / objective'],['temperatureC','Temperature','number','°C'],['humidity','Relative humidity','number','%']]},
  {title:'Limits, quality & handover',fields:[['maxPowerMw','Approved DUT power limit','number','mW'],['allowedStartNm','Validated path minimum wavelength','number','nm'],['allowedStopNm','Validated path maximum wavelength','number','nm'],['calibration','Calibration records / dates'],['acceptance','Acceptance criteria'],['realign','Realignment / repeat criteria'],['rawFolder','Raw data directory'],['naming','File naming convention'],['analysis','Post-processing steps / cs-testsuite settings'],['outputFolder','Processed results directory'],['sop','Approved local SOP path / URL'],['reviewer','Reviewer'],['reviewDate','Review date','date'],['notes','Session notes']]},
  {title:'Timing estimates (enter measured values)',fields:[['preparationMin','Preparation','number','min'],['alignmentSec','Alignment per site','number','s'],['measurementSec','Measurement per waveguide','number','s'],['moveSec','Move to next site','number','s'],['processingMin','Post-processing','number','min']]},
];
export const instanceFields=[['mountingStage','Mounted on stage instance ID'],['serial','Serial / asset ID'],['manufacturer','Manufacturer'],['exactModel','Exact model / option'],['specUrl','Specification website'],['specifications','Specifications / units / conditions'],['calibration','Calibration due / record'],['ports','Ports / connector options'],['dimensions','Dimensions / units'],['photoReference','Photo file / reference'],['cadReference','Original CAD file / vendor link'],['modelReference','GLB model path'],['licence','Asset source / licence'],['notes','Installed configuration notes']];
export const initialProcedure=[
  {title:'Prepare session',text:'Record wafer/device IDs, reference structure, objective and approved local procedure. Complete instrument and calibration records.'},
  {title:'Inspect and connect',text:'Verify the recorded input/output fibre path, sleeve interfaces and cleaved tips against the bench. Record actual cable lengths and connector ends.'},
  {title:'Mount and align',text:'Use the approved local loading procedure. Locate the grating couplers with the camera. Usual input/output fibre angle is 10° from wafer normal; adjust and record the actual setting.'},
  {title:'Set polarisation and acquire reference',text:'Configure polarisation and measurement settings. Record the reference path/structure and reference file. Confirm the permitted DUT power and wavelength range.'},
  {title:'Measure and review',text:'Acquire the manual measurement, record raw traces and inspect for alignment drift, noise and saturation. Add local acceptance and repeat criteria.'},
  {title:'Finish and post-process',text:'Follow the approved shutdown/unloading procedure. Retain raw data, reference data and configuration together; record the chosen post-processing method and output files.'},
];
export function createManualSetup(){
  const nodes=[
    ['laser','wst-laser-old','Laser',20,20],['sleeve-in','wst-mating-sleeve-manual','Input laser sleeve',240,20],['controller','wst-polarisation-manual','FPC562 controller',460,20],['sleeve-arm','wst-mating-sleeve-manual','Input arm sleeve',680,20],
    ['input-arm','wst-fibre-arms-manual','Input arm · cleaved SM',680,175],['dut','wst-wafer-holder-manual','Wafer / DUT',460,175],['output-arm','wst-fibre-arms-manual','Output arm · cleaved SM',240,175],['sleeve-out','wst-mating-sleeve-manual','Output sleeve',20,175],
    ['sensor','wst-sensor-old','Power sensor',20,330],['mainframe','wst-mainframe-manual','8163B laser & sensor mainframe',240,330],['stage','wst-stage-manual','DUT motion stage',460,330],['camera','wst-camera-manual','Alignment camera',680,330],
    ['input-fibre-stage','fibre-arm-stage','Input fibre arm stage',680,480],['output-fibre-stage','fibre-arm-stage','Output fibre arm stage',240,480],
  ].map(([id,equipmentId,label,x,y])=>{const e=manualEquipment.find(v=>v.id===equipmentId);return {id,equipmentId,label,x,y,configuration:{exactModel:e.model,specUrl:e.url,specifications:e.specs.map(([k,v])=>`${k}: ${v}`).join('\n')}};});
  const edge=(id,from,to,fibre,fromConnector,toConnector,notes,length='')=>({id,from,to,type:'optical',fromPort:'Output',toPort:'Input',fibre,customFibre:'',fromConnector,toConnector,length,notes});
  return addMainframeDefaults({version:1,id:'wst-optical-manual',name:'Manual wafer optical measurement',nodes,connections:[
    edge('M-O1','laser','sleeve-in','P3-1550PM-FC-2','FC/APC','FC/APC','User-reported PM patch cable. Verify installed instrument port.', '2 m nominal'),
    edge('M-O5','sleeve-in','controller','custom','FC/APC','FC/APC','FPC562 input lead; installed connector options to verify.'),
    edge('M-O6','controller','sleeve-arm','custom','FC/APC','FC/APC','FPC562 output lead; same assembly as M-O5, not a separate cable.'),
    edge('M-O2','sleeve-arm','input-arm','P3-SMF28Y-FC-5','FC/APC','Bare fibre','Cleaved SM fibre at input arm; actual cut length to enter.'),
    edge('GC-IN','input-arm','dut','custom','Bare fibre','Other','Free-space coupling to input grating; no cable or mating connector.'),
    edge('GC-OUT','dut','output-arm','custom','Other','Bare fibre','Free-space coupling from output grating; no cable or mating connector.'),
    edge('M-O3','output-arm','sleeve-out','P3-SMF28Y-FC-5','Bare fibre','FC/APC','Cleaved SM fibre at output arm; actual cut length to enter.'),
    edge('M-O4','sleeve-out','sensor','P3-1550PM-FC-2','FC/APC','FC/APC','User-reported PM patch cable. Verify installed sensor port.', '2 m nominal'),
  ].map(c=>({...c,customFibre:['M-O5','M-O6'].includes(c.id)?'FPC562 preloaded fibre assembly':['GC-IN','GC-OUT'].includes(c.id)?'Free-space grating coupling':''})),measurement:Object.fromEntries(manualGroups.flatMap(g=>g.fields.map(([key])=>[key,({lab:'Lab 2077',laserPowerMw:10,inputAngle:10,outputAngle:10,coupling:'Grating couplers'})[key]??'']))),procedure:structuredClone(initialProcedure),recordStatus:'Draft · local verification pending'});
}

// Apply the confirmed mounting distinction to older drafts without resetting user work.
export function upgradeManualSetup(data){
  if(data.id!=='wst-optical-manual'||data.manualAssemblyRevision>=1)return addMainframeDefaults(addBenchDefaults(data));
  const next=structuredClone(data), part=manualEquipment.find(e=>e.id==='fibre-arm-stage');
  for(const [side,x] of [['input',680],['output',240]]){
    const id=`${side}-fibre-stage`;
    if(!next.nodes.some(n=>n.id===id)&&next.nodes.length<100)next.nodes.push({id,equipmentId:part.id,label:`${side==='input'?'Input':'Output'} fibre arm stage`,x,y:480,configuration:{exactModel:part.model,specUrl:part.url,specifications:part.specs.map(([k,v])=>`${k}: ${v}`).join('\n'),notes:`Supports the ${side} bespoke fibre arm. Physical mounting dimensions remain to confirm.`}});
    const arm=next.nodes.find(n=>n.id===`${side}-arm`);
    if(arm)arm.configuration={...arm.configuration,mountingStage:arm.configuration?.mountingStage||id};
  }
  for(const n of next.nodes.filter(n=>n.equipmentId==='wst-stage-manual')){
    if(n.label==='3-axis stage')n.label='DUT motion stage';
    const cfg=n.configuration||{};
    if(cfg.exactModel==='Thorlabs NanoMax · exact model pending'){n.configuration={...cfg,exactModel:'Model pending',specUrl:cfg.specUrl==='https://www.thorlabs.com/3-axis-nanomax-tm-flexure-stages'?'':cfg.specUrl,notes:[cfg.notes,'DUT motion stage remains to identify; MAX313D is used for the fibre arms.'].filter(Boolean).join('\n')};}
  }
  next.measurement={...next.measurement,inputFibreStageModel:next.measurement?.inputFibreStageModel||'Thorlabs MAX313D',outputFibreStageModel:next.measurement?.outputFibreStageModel||'Thorlabs MAX313D'};
  next.manualAssemblyRevision=1;
  return addMainframeDefaults(addBenchDefaults(next));
}
