import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { RuleFile } from '../types/index';

// 获取当前文件目录
let __filename: string;
let __dirname: string;

// 这段代码会在编译时被替换
// @ts-ignore
if (typeof IMPORT_META_URL !== 'undefined') {
    // ESM 环境
    // @ts-ignore
    __filename = fileURLToPath(IMPORT_META_URL as string);
    __dirname = dirname(__filename);
} else {
    // CommonJS 环境
    __filename = require.main?.filename || '';
    __dirname = path.dirname(__filename);
}

// 获取规则目录路径
export function getRulesDir() {
    // 使用环境变量判断环境
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
        // 开发环境：规则在项目根目录下
        return path.resolve(process.cwd(), 'rules');
    } else {
        // 生产环境：规则与可执行文件在同一目录
        return path.resolve(__dirname, './rules');
    }
}

/**
 * Get all rule modules
 * @param baseDir Optional base directory for rules
 * @returns Array of module names
 */
export async function getRuleFolders(baseDir?: string): Promise<string[]> {
    const rulesDir = baseDir
        ? path.join(baseDir, 'rules')
        : getRulesDir();

    try {
        const entries = await fs.readdir(rulesDir, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(dir => dir.name);
    } catch (error) {
        console.error(`Error reading rule modules: ${error}`);
        return [];
    }
}

/**
 * Get all rule files from specified modules
 * @param modules Array of module names
 * @param baseDir Optional base directory for rules
 * @returns Array of rule file objects
 */
export async function getRuleFiles(modules: string[], baseDir?: string): Promise<Array<{ folder: string, name: string, path: string }>> {
    const ruleFiles: Array<RuleFile> = [];

    try {
        const rulesDir = baseDir
            ? path.join(baseDir, 'rules')
            : getRulesDir();

        for (const module of modules) {
            const modulePath = path.join(rulesDir, module);

            try {
                // 尝试访问模块目录
                await fs.access(modulePath).catch(() => {
                    console.warn(`Module ${module} does not exist`);
                    return Promise.reject(new Error('ENOENT'));
                });

                // 读取模块内容
                const files = await fs.readdir(modulePath);
                const mdcFiles = files.filter(file => file.endsWith('.mdc'));

                for (const file of mdcFiles) {
                    ruleFiles.push({
                        folder: module,
                        name: file,
                        path: path.join(modulePath, file)
                    });
                }
            } catch (error) {
                if (error.message !== 'ENOENT') {
                    console.error(`Error reading module ${module}: ${error.message}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error getting rule files: ${error.message}`);
    }

    return ruleFiles;
} 