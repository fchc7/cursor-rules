import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { pullRuleFiles, pullAllFilesFromFolders } from '../../src/utils/pullUtils';
import * as fileUtils from '../../src/utils/fileUtils';
import { RuleFile } from '../../src/types';

// 模拟依赖
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(),
        mkdirSync: vi.fn(),
        readFileSync: vi.fn(),
        copyFileSync: vi.fn()
    }
}));

vi.mock('inquirer', () => ({
    default: {
        prompt: vi.fn()
    }
}));

vi.mock('../../src/utils/fileUtils');

// 模拟 console
const mockConsole = {
    log: vi.fn(),
    error: vi.fn()
} as unknown as Console;

global.console = mockConsole;

describe('pullUtils', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('pullRuleFiles', () => {
        const mockFiles: RuleFile[] = [
            { folder: 'js', name: 'rule1.mdc', path: '/source/js/rule1.mdc' },
            { folder: 'rust', name: 'rule2.mdc', path: '/source/rust/rule2.mdc' }
        ];

        it('should create target directory if not exists', async () => {
            vi.mocked(fs.existsSync).mockReturnValueOnce(false);

            await pullRuleFiles(mockFiles);

            expect(fs.mkdirSync).toHaveBeenCalledWith(
                expect.stringContaining(path.join('.cursor', 'rules')),
                { recursive: true }
            );
        });

        it('should skip identical files', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync)
                .mockReturnValueOnce('content')  // 源文件内容
                .mockReturnValueOnce('content'); // 目标文件内容

            const result = await pullRuleFiles([mockFiles[0]]);

            expect(result.skipped).toContain('js/rule1.mdc');
            expect(result.success).toHaveLength(0);
            expect(fs.copyFileSync).not.toHaveBeenCalled();
        });

        it('should prompt for overwrite when file exists with different content', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync)
                .mockReturnValueOnce('new content')    // 源文件内容
                .mockReturnValueOnce('old content');   // 目标文件内容

            vi.mocked(inquirer.prompt).mockResolvedValueOnce({ overwrite: true });

            const result = await pullRuleFiles([mockFiles[0]]);

            expect(inquirer.prompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: 'confirm',
                    name: 'overwrite'
                })
            ]);
            expect(result.success).toContain('js/rule1.mdc');
        });

        it('should skip when user declines overwrite', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync)
                .mockReturnValueOnce('new content')
                .mockReturnValueOnce('old content');

            vi.mocked(inquirer.prompt).mockResolvedValueOnce({ overwrite: false });

            const result = await pullRuleFiles([mockFiles[0]]);

            expect(result.skipped).toContain('js/rule1.mdc');
            expect(fs.copyFileSync).not.toHaveBeenCalled();
        });

        it('should handle file copy errors', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            vi.mocked(fs.copyFileSync).mockImplementationOnce(() => {
                throw new Error('Copy failed');
            });

            const result = await pullRuleFiles([mockFiles[0]]);

            expect(result.failed).toContain('js/rule1.mdc');
            expect(console.error).toHaveBeenCalled();
        });

        it('should use custom base directory when provided', async () => {
            const customDir = '/custom/path';
            vi.mocked(fs.existsSync).mockReturnValue(false);

            await pullRuleFiles(mockFiles, customDir);

            expect(fs.mkdirSync).toHaveBeenCalledWith(
                path.join(customDir, '.cursor', 'rules'),
                { recursive: true }
            );
        });
    });

    describe('pullAllFilesFromFolders', () => {
        it('should return null when no files found', async () => {
            vi.mocked(fileUtils.getRuleFiles).mockResolvedValue([]);

            const result = await pullAllFilesFromFolders(['js']);

            expect(result).toBeNull();
            expect(console.log).toHaveBeenCalledWith('No rule files found in the selected modules');
        });

        it('should pull all files from modules', async () => {
            const mockFiles = [
                { folder: 'js', name: 'rule1.mdc', path: '/source/js/rule1.mdc' }
            ];

            vi.mocked(fileUtils.getRuleFiles).mockResolvedValue(mockFiles);
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = await pullAllFilesFromFolders(['js']);

            expect(result).toEqual({
                success: ['js/rule1.mdc'],
                skipped: [],
                failed: []
            });
            expect(console.log).toHaveBeenCalledWith('Found 1 rule files in 1 modules');
        });

        it('should use custom base directory', async () => {
            const mockFiles = [
                { folder: 'js', name: 'rule1.mdc', path: '/source/js/rule1.mdc' }
            ];
            const customDir = '/custom/path';

            vi.mocked(fileUtils.getRuleFiles).mockResolvedValue(mockFiles);
            vi.mocked(fs.existsSync).mockReturnValue(false);

            await pullAllFilesFromFolders(['js'], customDir);

            expect(fs.mkdirSync).toHaveBeenCalledWith(
                path.join(customDir, '.cursor', 'rules'),
                { recursive: true }
            );
        });
    });
}); 