import fs from 'fs';
import path from 'path';
import { owner, repo } from '../utils/octokit.mjs';
import { getPackageJson } from '../utils/exec.mjs';

const PLACEHOLDER_REGEX = /\[VI\]\{\{(.+?)\}\}\[\/VI\]/g;

const packageJson = getPackageJson();

export default async function () {
   await new Promise(resolve => setTimeout(resolve, 50));
   const distDir = path.resolve('dist');

   if (!fs.existsSync(distDir)) {
      console.warn('dist directory not found, skipping patch step');
      return;
   }

   function getAllJsFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      return entries.flatMap(entry => {
         const fullPath = path.join(dir, entry.name);

         if (entry.isDirectory()) {
            return getAllJsFiles(fullPath);
         }

         if (entry.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.mjs'))) {
            return [fullPath];
         }

         return [];
      });
   }

   const jsFiles = getAllJsFiles(distDir);

   for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf8');

      if (!PLACEHOLDER_REGEX.test(content)) continue;

      const patched = content.replace(PLACEHOLDER_REGEX, (_match, key) => {
         switch (key) {
            case 'version':
               return getVersion();
            case 'name':
               return packageJson.name;
            case 'ghown':
               return owner;
            case 'ghrep':
               return repo;
            default:
               return _match;
         }
      });

      fs.writeFileSync(file, patched, 'utf8');
      console.log(`Patched: ${file}`);
   }
}

function getVersion() {
   return `v${packageJson?.version ?? '0.0.1'}`;
}
