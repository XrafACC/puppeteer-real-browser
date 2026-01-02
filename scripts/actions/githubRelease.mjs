import { exec, getPackageJson } from '../utils/exec.mjs';
import pack from 'libnpmpack';
import { checkTagExists, createRelease, createVersionTag, getCurrentCommitSha, owner, repo } from '../utils/octokit.mjs';
import { generateUncommittedChangelog } from './generateChangelog.mjs';

async function buildProject() {
   const pkg = getPackageJson();
   const version = `v${pkg.version}`;

   console.log('Starting GitHub Release Process');
   console.log(`Repository: ${owner}/${repo}`);
   console.log(`Version: ${version}`);

   const tagExists = await checkTagExists(version);
   if (tagExists) {
      console.log('Tag already exists, skipping release');
      return;
   }

   const currentSha = await getCurrentCommitSha();
   console.log(`Current commit: ${currentSha.slice(0, 7)}`);

   /* ---------- Build phase (fail fast) ---------- */

   try {
      console.log('Installing dependencies');
      exec('npm ci', { stdio: 'inherit' });

      console.log('Building project');
      exec('npm run build', {
         env: { ...process.env, BUILD_SOURCE: 'GH' },
         stdio: 'inherit',
      });
   } catch (err) {
      console.error('Build failed, aborting release');
      throw err;
   }

   /* ---------- Pack ---------- */

   console.log('Packing npm artifact');
   const tarballBuffer = await pack(process.cwd());

   /* ---------- Tag ---------- */

   await createVersionTag(version, currentSha);
   console.log(`Git tag created: ${version}`);

   /* ---------- Release notes ---------- */

   console.log('Generating changelog');
   const changelog = await generateUncommittedChangelog();

   const notes = changelog ? `## Release Notes\n\n${changelog}` : '## Release Notes\n\nNo notable changes';

   /* ---------- Release ---------- */

   const release = await createRelease(version, tarballBuffer, notes, {
      assetName: `${repo}-${version}.tgz`,
   });

   console.log('GitHub Release created');
   console.log(`Release URL: ${release.html_url}`);
}

void buildProject();
