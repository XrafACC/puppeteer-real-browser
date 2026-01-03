import { defineConfig } from 'tsup';

export default defineConfig({
   entry: ['src/index.ts'],
   tsconfig: 'tsconfig.json',
   outDir: 'dist',
   external: ['tslib'],
   format: ['esm'],
   clean: true,
   dts: {
      resolve: true,
      entry: 'src/index.ts',
   },
   onSuccess: async () => {
      const { default: patchBuild } = (await import('./scripts/actions/patch.mjs')) as {
         default: () => Promise<void> | void;
      };
      return patchBuild();
   },
});
