import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import libraryServer from './scripts/library-server.js';
import { cleanBuildBackups } from './scripts/clean-build-backups.mjs';
import path from 'node:path';

function excludeBackups(){let output;return {name:'exclude-local-library-backups',apply:'build',configResolved:config=>{output=path.resolve(config.root,config.build.outDir);},closeBundle:()=>cleanBuildBackups(output)};}

export default defineConfig({
  plugins: [react(), libraryServer(), excludeBackups()],
  base: './',
  server: { host: '0.0.0.0', port: 5174, strictPort: true, watch: { ignored: ['**/public/library/**', '**/.local/**'] } },
});
