import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

// 设置环境变量
process.env.NODE_ENV = 'production';

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: "node",
    format: "cjs",
    minify: false,
    external: [],
    define: {
        'process.env.NODE_ENV': '"production"',
        'IMPORT_META_URL': 'undefined'  // 在 CommonJS 环境中将 IMPORT_META_URL 定义为 undefined
    },
    plugins: [
        copy({
            assets: [
                {
                    from: ['rules/**/*'],
                    to: ['rules'],
                }
            ],
            verbose: false,
        }),
    ],
}).then(() => {
    console.log('Build complete ✨');
}).catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
}); 