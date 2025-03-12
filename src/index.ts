#!/usr/bin/env node

import { Command } from 'commander';
import { getRuleFiles, getRuleFolders } from './utils/fileUtils';
import { promptUserForRuleSelection, promptUserForFolderSelection } from './utils/promptUtils';
import { pullRuleFiles, pullAllFilesFromFolders } from './utils/pullUtils';
import { version } from '../package.json'

export async function main() {
    const program = new Command();

    program
        .name('pullrule')
        .description('Pull Cursor rule files to your local .cursor/rules directory')
        .version(version)
        .option('-j, --js', 'Pull JavaScript rules')
        .option('-r, --rust', 'Pull Rust rules')
        .option('-c, --common', 'Pull common rules')
        .option('-l, --list', 'List and select modules to pull all files from');

    program.parse();
    const options = program.opts();

    // List mode - select modules and pull all files
    if (options.list) {
        const availableModules = await getRuleFolders();

        if (availableModules.length === 0) {
            console.log('No rule modules found');
            return;
        }

        // Preselect modules based on options
        const preselected = [];
        if (options.js) preselected.push('js');
        if (options.rust) preselected.push('rust');
        if (options.common) preselected.push('common');

        const selectedModules = await promptUserForFolderSelection(availableModules, preselected);

        if (selectedModules.length === 0) {
            console.log('No modules selected');
            return;
        }

        const results = await pullAllFilesFromFolders(selectedModules);

        if (results) {
            console.log('\nPull completed:');
            console.log(`✅ Successfully pulled: ${results.success.length} files`);
            if (results.skipped.length > 0) {
                console.log(`⏭️ Skipped: ${results.skipped.length} files`);
            }
            if (results.failed.length > 0) {
                console.log(`❌ Failed: ${results.failed.length} files`);
            }
        }

        return;
    }

    // Normal mode - select specific files to pull
    const selectedModules = [];
    if (options.js) selectedModules.push('js');
    if (options.rust) selectedModules.push('rust');
    if (options.common) selectedModules.push('common');

    // If no modules specified, use all available modules
    const modules = selectedModules.length > 0
        ? selectedModules
        : await getRuleFolders();

    const ruleFiles = await getRuleFiles(modules);

    if (ruleFiles.length === 0) {
        console.log('No rule files found in the selected modules');
        return;
    }

    const selectedFiles = await promptUserForRuleSelection(ruleFiles);

    if (selectedFiles.length === 0) {
        console.log('No files selected');
        return;
    }

    const results = await pullRuleFiles(selectedFiles);

    console.log('\nPull completed:');
    console.log(`✅ Successfully pulled: ${results.success.join(', ')}`);
    if (results.skipped.length > 0) {
        console.log(`⏭️ Skipped: ${results.skipped.join(', ')}`);
    }
    if (results.failed.length > 0) {
        console.log(`❌ Failed: ${results.failed.join(', ')}`);
    }
}

// Run the main function
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
} 