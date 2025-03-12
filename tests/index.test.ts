import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { main } from '../src/index';
import * as fileUtils from '../src/utils/fileUtils';
import * as promptUtils from '../src/utils/promptUtils';
import * as pullUtils from '../src/utils/pullUtils';

// 模拟依赖
vi.mock('commander', () => ({
    Command: vi.fn(() => ({
        name: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        parse: vi.fn().mockReturnThis(),
        opts: vi.fn().mockReturnValue({})
    }))
}));

vi.mock('../src/utils/fileUtils');
vi.mock('../src/utils/promptUtils');
vi.mock('../src/utils/pullUtils');

// 模拟 console
const mockConsole = {
    log: vi.fn(),
    error: vi.fn()
} as unknown as Console;

global.console = mockConsole;

describe('index.ts', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('main function', () => {
        it('should handle list mode with no modules found', async () => {
            vi.mocked(Command).mockImplementation(() => ({
                name: vi.fn().mockReturnThis(),
                description: vi.fn().mockReturnThis(),
                version: vi.fn().mockReturnThis(),
                option: vi.fn().mockReturnThis(),
                parse: vi.fn().mockReturnThis(),
                opts: vi.fn().mockReturnValue({ list: true })
            } as any));

            vi.mocked(fileUtils.getRuleFolders).mockResolvedValue([]);

            await main();

            expect(console.log).toHaveBeenCalledWith('No rule modules found');
        });

        it('should handle list mode with selected modules', async () => {
            vi.mocked(Command).mockImplementation(() => ({
                name: vi.fn().mockReturnThis(),
                description: vi.fn().mockReturnThis(),
                version: vi.fn().mockReturnThis(),
                option: vi.fn().mockReturnThis(),
                parse: vi.fn().mockReturnThis(),
                opts: vi.fn().mockReturnValue({ list: true, js: true })
            } as any));

            vi.mocked(fileUtils.getRuleFolders).mockResolvedValue(['js', 'rust']);
            vi.mocked(promptUtils.promptUserForFolderSelection).mockResolvedValue(['js']);
            vi.mocked(pullUtils.pullAllFilesFromFolders).mockResolvedValue({
                success: ['file1.mdc'],
                skipped: [],
                failed: []
            });

            await main();

            expect(pullUtils.pullAllFilesFromFolders).toHaveBeenCalledWith(['js']);
            expect(console.log).toHaveBeenCalledWith('✅ Successfully pulled: 1 files');
        });

        it('should handle normal mode with no files found', async () => {
            vi.mocked(Command).mockImplementation(() => ({
                name: vi.fn().mockReturnThis(),
                description: vi.fn().mockReturnThis(),
                version: vi.fn().mockReturnThis(),
                option: vi.fn().mockReturnThis(),
                parse: vi.fn().mockReturnThis(),
                opts: vi.fn().mockReturnValue({ js: true })
            } as any));

            vi.mocked(fileUtils.getRuleFiles).mockResolvedValue([]);

            await main();

            expect(console.log).toHaveBeenCalledWith('No rule files found in the selected modules');
        });

        it('should handle normal mode with selected files', async () => {
            const mockFiles = [
                { folder: 'js', name: 'rule1.mdc', path: '/path/to/js/rule1.mdc' }
            ];

            vi.mocked(Command).mockImplementation(() => ({
                name: vi.fn().mockReturnThis(),
                description: vi.fn().mockReturnThis(),
                version: vi.fn().mockReturnThis(),
                option: vi.fn().mockReturnThis(),
                parse: vi.fn().mockReturnThis(),
                opts: vi.fn().mockReturnValue({ js: true })
            } as any));

            vi.mocked(fileUtils.getRuleFiles).mockResolvedValue(mockFiles);
            vi.mocked(promptUtils.promptUserForRuleSelection).mockResolvedValue(mockFiles);
            vi.mocked(pullUtils.pullRuleFiles).mockResolvedValue({
                success: ['js/rule1.mdc'],
                skipped: [],
                failed: []
            });

            await main();

            expect(pullUtils.pullRuleFiles).toHaveBeenCalledWith(mockFiles);
            expect(console.log).toHaveBeenCalledWith('✅ Successfully pulled: js/rule1.mdc');
        });

        it('should handle errors gracefully', async () => {
            vi.mocked(Command).mockImplementation(() => ({
                name: vi.fn().mockReturnThis(),
                description: vi.fn().mockReturnThis(),
                version: vi.fn().mockReturnThis(),
                option: vi.fn().mockReturnThis(),
                parse: vi.fn().mockReturnThis(),
                opts: vi.fn().mockReturnValue({})
            } as any));

            vi.mocked(fileUtils.getRuleFolders).mockRejectedValue(new Error('Test error'));

            await main().catch(error => {
                expect(error.message).toBe('Test error');
            });
        });
    });
}); 