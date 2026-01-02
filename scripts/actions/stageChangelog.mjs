import { exec } from '../utils/exec.mjs';

console.log('⚠️ Staging CHANGELOG.md changes...');
exec('git add CHANGELOG.md');
console.log('✔️ Staged CHANGELOG.md changes!');
