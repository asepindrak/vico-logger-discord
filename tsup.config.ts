import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outExtension: ({ format }) => {
        if (format === 'esm') return { js: '.mjs' }; // returning .mjs
        if (format === 'cjs') return { js: '.cjs' }; // returning .cjs
        return { js: '.js' }; // default case if necessary
    }
});