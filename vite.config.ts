import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [preact()],
    base: command === 'build' ? '/shogi-log/' : '/',
    build: {
        outDir: 'dist',
    },
}))
