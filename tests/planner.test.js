import test from 'node:test';
import assert from 'node:assert/strict';
import { plannerDefaults, estimateTime, formatDuration } from '../src/lib/planner.js';
import { setups, equipment, matchesSetup } from '../src/data/catalog.js';

test('continuous job includes every timed activity and applies buffer once', () => {
  const r=estimateTime(plannerDefaults);
  assert.equal(r.devices,48);
  assert.equal(r.scans,96);
  assert.equal(r.scanSeconds,10.5);
  assert.equal(r.base,6216);
  assert.equal(r.total,7459.2);
  assert.equal(formatDuration(r.total),'2 h 5 min');
});
test('stepped acquisition counts sampled points and dwell / settling', () => {
  const r=estimateTime({...plannerDefaults,acquisition:'stepped',startNm:1520,endNm:1521,stepNm:.1,dwellMs:20,settleMs:10});
  assert.equal(r.points,11);
  assert.equal(r.scanSeconds,.33);
});
test('wafer count, die count, devices and conditions all multiply acquisition', () => {
  const r=estimateTime({...plannerDefaults,units:2,diesPerWafer:30,sites:8,sweeps:3,conditions:2},{wafer:true});
  assert.equal(r.devices,480);
  assert.equal(r.scans,2880);
  assert.equal(r.parts[1].seconds,480);
  assert.equal(r.parts[2].seconds,21600);
});
test('electrical acquisition uses sequence duration and ignores wavelength model', () => {
  const r=estimateTime({...plannerDefaults,dwellMs:2000,sweepSpeed:0,endNm:1},{spectral:false});
  assert.equal(r.valid,true);
  assert.equal(r.scanSeconds,2);
  assert.equal(r.points,null);
});
test('invalid inputs cannot produce Infinity, NaN or negative estimates', () => {
  for(const patch of [{units:0},{units:1.5},{sites:-1},{units:''},{alignmentSeconds:NaN},{sweepSpeed:0},{endNm:1500},{marginPercent:Infinity},{acquisition:'stepped',stepNm:0}]) {
    assert.equal(estimateTime({...plannerDefaults,...patch}).valid,false,JSON.stringify(patch));
  }
});
test('zero optional overhead is valid; rounding reserves whole minutes', () => {
  assert.equal(estimateTime({...plannerDefaults,setupMinutes:0,overhead:0,loadMinutes:0,alignmentSeconds:0,referenceSeconds:0,postMinutes:0,marginPercent:0}).valid,true);
  assert.equal(formatDuration(60.1),'2 min');
});
test('electrical devices without an optical band need All bands', () => {
  const s=setups.find(s=>s.id==='chip-resistance');
  assert.equal(matchesSetup(s,{scale:'Chip',mode:'Electrical',band:'C-band'}),false);
  assert.equal(matchesSetup(s,{scale:'Chip',mode:'Electrical',band:''}),true);
});
test('catalog references exist and WST does not claim chip instrument models', () => {
  const ids=equipment.map(e=>e.id);
  assert.equal(new Set(ids).size,ids.length);
  for(const s of setups) for(const id of s.equipment) assert.ok(ids.includes(id),`${s.id}: ${id}`);
  const wst=setups.find(s=>s.id==='wafer-optical');
  assert.ok(!wst.equipment.includes('laser'));
  assert.ok(!wst.equipment.includes('detector'));
});
