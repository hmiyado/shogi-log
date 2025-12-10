import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    // submodule として使う場合は環境変数で制御
    const isSubmodule = process.env.SHOGI_LOG_SUBMODULE === 'true'

    return {
        plugins: [preact()],
        base: command === 'build' ? '/shogi-log/' : '/',
        // submodule の場合は親ディレクトリの public/ を参照
        publicDir: isSubmodule ? '../public' : 'public',
        build: {
            // submodule の場合は親ディレクトリに出力
            outDir: isSubmodule ? '../dist' : 'dist',
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
    }
})
