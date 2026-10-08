import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';

// Vite copies public files outside the Rollup bundle. Exclude local recovery
// copies from local production builds as well as from GitHub checkouts.
export async function cleanBuildBackups(outputDirectory) {
  const root=path.resolve(outputDirectory,'library');
  async function visit(directory) {
    let entries;try{entries=await readdir(directory,{withFileTypes:true});}catch(error){if(error.code==='ENOENT')return;throw error;}
    for(const entry of entries){
      const target=path.resolve(directory,entry.name);
      if(!target.startsWith(root+path.sep))throw new Error('Invalid build cleanup path.');
      if(entry.isDirectory())await visit(target);
      else if(entry.isFile()&&/\.(bak|tmp)$/i.test(entry.name))await rm(target);
    }
  }
  await visit(root);
}
