import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { RuleFile } from '../types/index';
import { getRuleFiles } from './fileUtils';

/**
 * Pull selected rule files to local .cursor/rules directory
 * @param files Array of rule files to pull
 * @param baseDir Optional base directory
 * @returns Object with success, skipped, and failed files
 */
export async function pullRuleFiles(
    files: RuleFile[],
    baseDir?: string
): Promise<{ success: string[], skipped: string[], failed: string[] }> {
    const results = {
        success: [] as string[],
        skipped: [] as string[],
        failed: [] as string[]
    };

    // Get target directory (.cursor/rules in user's home directory)
    const targetDir = path.join(
        baseDir || process.cwd(),
        '.cursor',
        'rules'
    );

    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Process each file
    for (const file of files) {
        const targetPath = path.join(targetDir, file.name);
        const fileKey = `${file.folder}/${file.name}`;

        try {
            // Check if file already exists
            if (fs.existsSync(targetPath)) {
                const sourceContent = fs.readFileSync(file.path, 'utf8');
                const targetContent = fs.readFileSync(targetPath, 'utf8');

                // If content is identical, skip
                if (sourceContent === targetContent) {
                    console.log(`Skipping ${fileKey} (already up to date)`);
                    results.skipped.push(fileKey);
                    continue;
                }

                // Ask user if they want to overwrite
                const answer = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'overwrite',
                        message: `File ${file.name} already exists. Overwrite?`,
                        default: false
                    }
                ]);

                if (!answer.overwrite) {
                    console.log(`Skipping ${fileKey} (not overwritten)`);
                    results.skipped.push(fileKey);
                    continue;
                }
            }

            // Copy file
            fs.copyFileSync(file.path, targetPath);
            console.log(`Pulled ${fileKey}`);
            results.success.push(fileKey);
        } catch (error) {
            console.error(`Error pulling ${fileKey}: ${error}`);
            results.failed.push(fileKey);
        }
    }

    return results;
}

/**
 * Pull all rule files from specified modules
 * @param modules Array of module names
 * @param baseDir Optional base directory
 * @returns Object with success, skipped, and failed files or null if no files found
 */
export async function pullAllFilesFromFolders(
    modules: string[],
    baseDir?: string
): Promise<{ success: string[], skipped: string[], failed: string[] } | null> {
    // Get all rule files from specified modules
    const files = await getRuleFiles(modules);

    if (files.length === 0) {
        console.log('No rule files found in the selected modules');
        return null;
    }

    console.log(`Found ${files.length} rule files in ${modules.length} modules`);
    return await pullRuleFiles(files, baseDir);
} 