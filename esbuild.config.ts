import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { builtinModules } from 'module';

// Set environment variables
process.env.NODE_ENV = 'production';

// Node.js built-in modules list
const nodeBuiltins = builtinModules.flatMap(m => [m, `node:${m}`]);

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: "node",
    format: "cjs",
    minify: true,
    define: {
        'process.env.NODE_ENV': '"production"',
        'IMPORT_META_URL': 'undefined'  // Define IMPORT_META_URL as undefined in CommonJS environment
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