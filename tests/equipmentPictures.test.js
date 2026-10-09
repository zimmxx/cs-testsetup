import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validateEquipment} from '../src/lib/library.js';
import {withPictureDefaults, replacePicture} from '../src/lib/equipmentPictures.js';

const items = JSON.parse(fs.readFileSync('public/library/equipment.json','utf8')).equipment;
const sources = JSON.parse(fs.readFileSync('public/library/images/sources.json','utf8')).equipment;

test('every equipment picture exists, retains its source, and matches the acquisition checksum',()=>{
  assert.equal(new Set(sources.map(e=>e.equipmentId)).size,sources.length);
  for (const item of items) {
    validateEquipment(item);
    assert.ok(item.image,item.id);
    assert.ok(item.imageCredit && item.imageKind && item.imageReview,item.id);
    assert.ok(item.imageSource || item.imageSourcePath,item.id);
    if (item.imageSourcePath) assert.ok(fs.existsSync(path.join('public',item.imageSourcePath)),item.id);
    const bytes=fs.readFileSync(path.join('public',item.image));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),item.imageSha256,item.id);
    assert.ok(bytes.length>1000,item.id);
    assert.ok(item.imageWidth>=100 && item.imageHeight>=100,item.id);
    assert.deepEqual(sources.find(e=>e.equipmentId===item.id)?.image,item.image,item.id);
  }
});

test('picture migration keeps edited equipment specs and custom draft pictures',()=>{
  const shared=items.find(e=>e.id==='wst-polarisation-manual');
  const oldDraft={...shared,image:'',name:'My edited controller',specs:[['Setting','Recorded locally']]};
  delete oldDraft.imageSource;
  const updated=withPictureDefaults(oldDraft,shared);
  assert.equal(updated.image,shared.image);
  assert.equal(updated.imageSource,shared.imageSource);
  assert.equal(updated.name,oldDraft.name);
  assert.deepEqual(updated.specs,oldDraft.specs);
  const custom={...oldDraft,image:'library/images/my-controller.png',imageCredit:'My lab photo'};
  assert.equal(withPictureDefaults(custom,shared),custom);
});

test('replacing a picture clears stale vendor provenance and rejects unsafe sources',()=>{
  const source=items[0];
  const updated=replacePicture(source,'library/images/my-photo.png');
  assert.ok(!updated.imageSource && !updated.imageSha256 && !updated.imageSourcePath);
  assert.equal(updated.imageKind,'User-supplied picture');
  assert.equal(source.imageSource,items[0].imageSource);
  assert.throws(()=>validateEquipment({...source,imageSource:'javascript:alert(1)'}));
  assert.throws(()=>validateEquipment({...source,imageSourcePath:'documents/../secret.txt'}));
  assert.throws(()=>validateEquipment({...source,imageWidth:-1}));
});
