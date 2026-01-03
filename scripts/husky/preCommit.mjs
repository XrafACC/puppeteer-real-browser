import { exec } from '../utils/exec.mjs';

console.log('✨ Checking lint');

exec('npm run lint');

console.log('✨ Building application');

exec('npm run build');
