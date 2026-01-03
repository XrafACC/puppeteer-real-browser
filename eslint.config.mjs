import json from '@eslint/json';
import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import oxlintPlugin from 'eslint-plugin-oxlint';

export default ts.config(
   {
      ignores: ['package-lock.json', 'dist/**/*', '**/node_modules/**', '**/*.d.ts', 'tsconfig.json'],
   },

   {
      files: ['**/*.{js,mjs,cjs}'],
      ...js.configs.recommended,
      languageOptions: {
         globals: { ...globals.node },
      },
   },

   {
      files: ['**/*.{ts,tsx,mts}'],
      extends: [...ts.configs.recommendedTypeChecked, ...ts.configs.stylisticTypeChecked],
      languageOptions: {
         parserOptions: {
            projectService: {
               allowDefaultProject: ['*.ts', 'tsup.config.ts'],
            },
            tsconfigRootDir: import.meta.dirname,
         },
      },
      plugins: {
         '@typescript-eslint': ts.plugin,
      },
      rules: {
         '@typescript-eslint/no-explicit-any': 'error',
         '@typescript-eslint/no-floating-promises': 'error',
         '@typescript-eslint/no-misused-promises': 'error',
         'no-return-await': 'off',
         '@typescript-eslint/return-await': 'error',
      },
   },

   {
      files: ['**/*.json'],
      plugins: { json },
      language: 'json/json',
      rules: {
         'json/no-duplicate-keys': 'error',
      },
   },
   {
      files: ['**/*.jsonc'],
      plugins: { json },
      language: 'json/jsonc',
      rules: {
         'json/no-duplicate-keys': 'error',
      },
   },
   {
      files: ['**/*.json5'],
      plugins: { json },
      language: 'json/json5',
      rules: {
         'json/no-duplicate-keys': 'error',
      },
   },

   {
      plugins: {
         prettier: prettierPlugin,
      },
      rules: {
         'prettier/prettier': 'warn',
         ...prettierConfig.rules,
      },
   },
   {
      plugins: {
         oxlint: oxlintPlugin,
      },
      rules: {
         ...oxlintPlugin.configs.recommended.rules,
      },
   },
);
