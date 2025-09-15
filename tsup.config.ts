import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outExtension: ({ format }) => {
        if (format === 'esm') return { js: '.mjs' }; // ESM format outputs "index.mjs"
        if (format === 'cjs') return { js: '.js' };  // Change to output "index.js" for CJS
        return { js: '.js' }; // You can keep this if needed for any other format, but it's not strictly necessary here.
    }
});