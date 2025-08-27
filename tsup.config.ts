import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outExtension: ({ format }) => {
        if (format === 'cjs') return { js: '.cjs' }
        if (format === 'esm') return { js: '.mjs' }
        return {}
    },
})
