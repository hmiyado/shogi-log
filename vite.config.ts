import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [preact()],
    base: command === 'build' ? '/shogi-log/' : '/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
                statistics: 'statistics.html',
                player: 'player.html',
                viewer: 'viewer.html',
            },
        },
    },
    test: {
        include: ['**/*.test.{js,ts,jsx,tsx}'],
        environment: 'happy-dom',
    },
}))
