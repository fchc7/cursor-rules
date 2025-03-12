import inquirer from 'inquirer';
import chalk from 'chalk';
import { RuleFile } from '../types/index';

/**
 * Prompt user to select rule modules
 * @param modules Available modules
 * @param preselected Preselected modules
 * @returns Selected modules
 */
export async function promptUserForFolderSelection(modules: string[], preselected: string[] = []): Promise<string[]> {
    const choices = modules.map(module => ({
        name: `📦 ${module}`,
        value: module,
        checked: preselected.includes(module)
    }));

    const answers = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedModules',
            message: 'Select rule modules to pull:',
            choices,
            pageSize: 10
        }
    ]);

    return answers.selectedModules;
}

/**
 * Prompt user to select rule files
 * @param ruleFiles Available rule files
 * @returns Selected rule files
 */
export async function promptUserForRuleSelection(ruleFiles: RuleFile[]): Promise<RuleFile[]> {
    // Group files by module
    const filesByModule: Record<string, RuleFile[]> = {};

    for (const file of ruleFiles) {
        if (!filesByModule[file.folder]) {
            filesByModule[file.folder] = [];
        }
        filesByModule[file.folder].push(file);
    }

    // Create choices with module separators
    const choices: any[] = [];

    for (const module of Object.keys(filesByModule).sort()) {
        // Add empty line before module (except for first module)
        if (choices.length > 0) {
            choices.push(new inquirer.Separator(' '));
        }

        // Add module separator with icon
        choices.push(new inquirer.Separator(chalk.whiteBright(`> ${module}`)));

        // Add files in this module
        for (const file of filesByModule[module]) {
            choices.push({
                name: `📄 ${file.name}`,
                value: file,
                short: file.name
            });
        }
    }

    const answers = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedFiles',
            message: 'Select rule files to pull:',
            choices,
            pageSize: 15
        }
    ]);

    return answers.selectedFiles;
} 