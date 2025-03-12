import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { RuleFile } from '../types/index';

// Get current file directory
let __filename: string;
let __dirname: string;

// This code will be replaced during compilation
// @ts-ignore
if (typeof IMPORT_META_URL !== 'undefined') {
    // ESM environment
    // @ts-ignore
    __filename = fileURLToPath(IMPORT_META_URL as string);
    __dirname = dirname(__filename);
} else {
    // CommonJS environment
    __filename = require.main?.filename || '';
    __dirname = path.dirname(__filename);
}

// Get rules directory path
export function getRulesDir() {
    // Use environment variable to determine environment
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
        // Development environment: rules in project root directory
        return path.resolve(process.cwd(), 'rules');
    } else {
        // Production environment: rules in the same directory as executable
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
                // Try to access module directory
                await fs.access(modulePath).catch(() => {
                    console.warn(`Module ${module} does not exist`);
                    return Promise.reject(new Error('ENOENT'));
                });

                // Read module contents
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