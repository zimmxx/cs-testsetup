import { mkdir, readFile, writeFile, rename, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { validateEquipment } from '../src/lib/library.js';
import { validateSetup } from '../src/lib/setupBuilder.js';
import { equipment } from '../src/data/catalog.js';
import { validatePublication } from '../src/lib/publishedSetups.js';
import { validateWorkspace } from '../src/lib/workspace_draft.js';
import { cadRuntime, assemblyManifest, exportAssemblyPackage } from './cad-assembly-service.mjs';
const execute=promisify(execFile);

async function body(req,limit) {
  const chunks=[];let size=0;
  for await (const chunk of req) {size+=chunk.length;if(size>limit) throw new Error('File exceeds size limit.');chunks.push(chunk);}
  return Buffer.concat(chunks);
}
export default function libraryServer() {
  return {name:'local-equipment-library',configureServer(server) {
    const root=path.resolve(server.config.root,'public/library');
    const converter=path.resolve(server.config.root,'.local/cad-tools/package');
    let exportingCad=false;
    server.middlewares.use(async(req,res,next)=> {
      const url=new URL(req.url,'http://localhost');
      // Vite's cached public-file inventory does not include newly uploaded
      // assets when library watching is disabled. Serve them immediately.
      const assetPath=decodeURIComponent(url.pathname);
      const reference=/^\/library\/references\/[a-zA-Z0-9 _./-]+\.(step|stp|pdf|json|sldprt|sldasm)$/i.test(assetPath)&&!assetPath.split('/').includes('..');
      if(req.method==='GET' && (reference||/^\/library\/(images|models|setups|published|workspaces_draft)\/[a-zA-Z0-9._-]+$/.test(assetPath))) {
        try {const filename=path.resolve(root,assetPath.slice('/library/'.length));if(!filename.startsWith(root+path.sep))throw new Error('Invalid path');const data=await readFile(filename);const ext=path.extname(filename).toLowerCase();res.setHeader('Content-Type',({'.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.step':'application/step','.stp':'application/step'})[ext]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(data);}catch{res.statusCode=404;res.end('Asset not found.');}return;
      }
      if(!url.pathname.startsWith('/api/library/')) return next();
      res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
      const local=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
      const localHost=['localhost','127.0.0.1','[::1]'].includes(new URL(`http://${req.headers.host}`).hostname);
      const origin=req.headers.origin;
      const sameOrigin=!origin || origin===`http://${req.headers.host}`;
      if(url.pathname==='/api/library/status' && req.method==='GET') {let cadConversion=false;if(local)try{await access(path.join(converter,'dist/occt-import-js.js'));cadConversion=true;}catch{}res.end(JSON.stringify({writable:local&&localHost&&sameOrigin,folder:local?root:'public/library',cadConversion,cadAssembly:local&&localHost&&sameOrigin&&Boolean(await cadRuntime(server.config.root))}));return;}
      if(!local||!localHost||!sameOrigin) {res.statusCode=403;res.end(JSON.stringify({error:'Open this app on localhost to edit project files. Network access is read-only.'}));return;}
      try {
        await mkdir(root,{recursive:true});
        if(url.pathname==='/api/library/export-step' && req.method==='POST'){
          if(exportingCad)throw new Error('A CAD export is running. Try again when it finishes.');
          const data=JSON.parse((await body(req,1024*1024)).toString());
          if(typeof data.includeBench!=='boolean')throw new Error('Select whether to include the bench.');
          let extra=[];try{extra=JSON.parse(await readFile(path.join(root,'equipment.json'),'utf8')).equipment||[];}catch{}
          const items=[...new Map([...equipment,...extra].map(e=>[e.id,e])).values()];
          validateSetup(data.setup,items.map(e=>e.id));
          exportingCad=true;
          try{
            const manifest=await assemblyManifest(server.config.root,data.setup,items,data.includeBench),zip=await exportAssemblyPackage(server.config.root,manifest);
            res.setHeader('Content-Type','application/zip');res.setHeader('Content-Disposition','attachment; filename="setup-solidworks.zip"');res.end(zip);
          }finally{exportingCad=false;}
          return;
        }
        if(url.pathname==='/api/library/workspace-draft' && req.method==='PUT') {
          const data=JSON.parse((await body(req,2*1024*1024)).toString());
          let filename;
          if(data.workspaceName==='Equipment_draft') {
            if(data.version!==1||!Array.isArray(data.equipment)||!data.equipment.length||data.equipment.length>500)throw new Error('Invalid Equipment_draft catalog.');
            data.equipment.forEach(validateEquipment);
            if(new Set(data.equipment.map(e=>e.id)).size!==data.equipment.length)throw new Error('Equipment IDs must be unique.');
            filename='equipment_draft.json';
          } else {
            let extra=[];try{extra=JSON.parse(await readFile(path.join(root,'equipment.json'),'utf8')).equipment||[];}catch{}
            validateWorkspace(data,[...equipment,...extra].map(e=>e.id));
            filename=`${data.id}_draft.json`;
          }
          const folder=path.join(root,'workspaces_draft');await mkdir(folder,{recursive:true});
          const target=path.join(folder,filename);
          try{await writeFile(`${target}.bak`,await readFile(target));}catch(e){if(e.code!=='ENOENT')throw e;}
          await writeFile(`${target}.tmp`,JSON.stringify({...data,savedAtDraft:new Date().toISOString()},null,2)+'\n');await rename(`${target}.tmp`,target);
          res.end(JSON.stringify({saved:true,path:`library/workspaces_draft/${filename}`}));return;
        }
        if(url.pathname==='/api/library/publish' && req.method==='PUT') {
          const data=JSON.parse((await body(req,1024*1024)).toString());
          let extra=[];try{extra=JSON.parse(await readFile(path.join(root,'equipment.json'),'utf8')).equipment||[];}catch{}
          validatePublication(data,[...equipment,...extra].map(e=>e.id));
          const folder=path.join(root,'published');await mkdir(folder,{recursive:true});
          const target=path.join(folder,'index.json');let previous={version:1,setups:[]};
          try{const bytes=await readFile(target);previous=JSON.parse(bytes);if(previous.version!==1||!Array.isArray(previous.setups))throw new Error('Invalid publication index.');await writeFile(`${target}.bak`,bytes);}catch(e){if(e.code!=='ENOENT')throw e;}
          const snapshot={...data,publishedAt:new Date().toISOString()};
          const next={version:1,setups:[...previous.setups.filter(s=>s.id!==snapshot.id),snapshot]};
          await writeFile(`${target}.tmp`,JSON.stringify(next,null,2)+'\n');await rename(`${target}.tmp`,target);
          res.end(JSON.stringify({published:true,path:'library/published/index.json',id:data.id}));return;
        }
        if(url.pathname==='/api/library/setup' && req.method==='PUT') {
          const data=JSON.parse((await body(req,1024*1024)).toString());
          let extra=[];try{extra=JSON.parse(await readFile(path.join(root,'equipment.json'),'utf8')).equipment||[];}catch{}
          validateSetup(data,[...equipment,...extra].map(e=>e.id));
          if(!data.id)throw new Error('Set a setup ID before saving.');
          const folder=path.join(root,'setups');await mkdir(folder,{recursive:true});
          const target=path.join(folder,`${data.id}.json`);
          try {const previous=await readFile(target);await writeFile(`${target}.bak`,previous);}catch(error){if(error.code!=='ENOENT')throw error;}
          await writeFile(`${target}.tmp`,JSON.stringify({...data,savedAt:new Date().toISOString()},null,2)+'\n');await rename(`${target}.tmp`,target);
          res.end(JSON.stringify({saved:true,path:`library/setups/${data.id}.json`}));return;
        }
        if(url.pathname==='/api/library/equipment' && req.method==='PUT') {
          const data=JSON.parse((await body(req,2*1024*1024)).toString());
          if(!Array.isArray(data.equipment)||data.equipment.length>500) throw new Error('Invalid equipment catalog.');
          data.equipment.forEach(validateEquipment);
          if(new Set(data.equipment.map(e=>e.id)).size!==data.equipment.length) throw new Error('Equipment IDs must be unique.');
          const target=path.join(root,'equipment.json');
          await writeFile(`${target}.tmp`,JSON.stringify(data,null,2)+'\n');await rename(`${target}.tmp`,target);
          res.end(JSON.stringify({saved:true}));return;
        }
        if(url.pathname==='/api/library/assets' && req.method==='POST') {
          const kind=url.searchParams.get('kind'),id=url.searchParams.get('id'),name=url.searchParams.get('name')||'';
          if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)||!['images','models','step'].includes(kind)) throw new Error('Invalid asset destination.');
          const ext=path.extname(name).toLowerCase();
          if(!(kind==='step'?['.step','.stp']:kind==='models'?['.glb']:['.png','.jpg','.jpeg','.webp']).includes(ext)) throw new Error('Use PNG/JPG/WebP pictures, GLB models, or STEP/STP CAD.');
          const buffer=await body(req,40*1024*1024);
          if(kind==='step'){
            if(!buffer.subarray(0,512).toString('ascii').includes('ISO-10303-21;'))throw new Error('This file is not a STEP exchange file.');
            try{await access(path.join(converter,'dist/occt-import-js.js'));}catch{throw new Error('Local STEP converter unavailable. Preserve the CAD in references and attach a converted GLB.');}
            const stem=`${id}-${Date.now()}`,folder=path.join(root,'references',id);await mkdir(folder,{recursive:true});await mkdir(path.join(root,'models'),{recursive:true});
            const source=path.join(folder,stem+ext),model=path.join(root,'models',stem+'.glb');await writeFile(source,buffer);
            try{await execute(process.execPath,[path.resolve(server.config.root,'scripts/convert-step.mjs'),source,model,converter,...(url.searchParams.get('axis')==='z'?['--z-up']:[])],{cwd:server.config.root,timeout:120000,maxBuffer:2*1024*1024,windowsHide:true});}
            catch{throw new Error('STEP retained locally, but conversion failed or timed out. Check for solid 3D geometry and use a GLB conversion if needed.');}
            res.end(JSON.stringify({path:`library/references/${id}/${stem}${ext}`,model3d:`library/models/${stem}.glb`,stepSha256:createHash('sha256').update(buffer).digest('hex')}));return;
          }
          if(kind==='models' && (buffer.length<12||buffer.toString('ascii',0,4)!=='glTF'||buffer.readUInt32LE(4)!==2||buffer.readUInt32LE(8)!==buffer.length)) throw new Error('This is not a valid GLB 2.0 file.');
          const filename=`${id}-${Date.now()}${ext}`;
          await mkdir(path.join(root,kind),{recursive:true});await writeFile(path.join(root,kind,filename),buffer);
          res.end(JSON.stringify({path:`library/${kind}/${filename}`}));return;
        }
        res.statusCode=404;res.end(JSON.stringify({error:'Unknown library action.'}));
      } catch(error) {res.statusCode=400;res.end(JSON.stringify({error:error.message}));}
    });
  }};
}
