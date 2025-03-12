import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import { promptUserForFolderSelection, promptUserForRuleSelection } from '../../src/utils/promptUtils';
import { RuleFile } from '../../src/types';

// 模拟 inquirer
vi.mock('inquirer', () => ({
    default: {
        prompt: vi.fn(),
        Separator: class {
            type: string;
            line: string;
            constructor(text?: string) {
                this.type = 'separator';
                this.line = text || '';
            }
        }
    }
}));

describe('promptUtils', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('promptUserForFolderSelection', () => {
        it('should prompt user to select modules', async () => {
            const modules = ['js', 'rust', 'common'];
            const preselected = ['js'];

            vi.mocked(inquirer.prompt).mockResolvedValueOnce({
                selectedModules: ['js', 'rust']
            });

            const result = await promptUserForFolderSelection(modules, preselected);

            expect(result).toEqual(['js', 'rust']);
            expect(inquirer.prompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: 'checkbox',
                    name: 'selectedModules',
                    message: 'Select rule modules to pull:',
                    choices: [
                        { name: '📦 js', value: 'js', checked: true },
                        { name: '📦 rust', value: 'rust', checked: false },
                        { name: '📦 common', value: 'common', checked: false }
                    ],
                    pageSize: 10
                })
            ]);
        });

        it('should handle empty modules list', async () => {
            vi.mocked(inquirer.prompt).mockResolvedValueOnce({
                selectedModules: []
            });

            const result = await promptUserForFolderSelection([]);

            expect(result).toEqual([]);
            expect(inquirer.prompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    choices: []
                })
            ]);
        });
    });

    describe('promptUserForRuleSelection', () => {
        it('should prompt user to select rule files', async () => {
            const ruleFiles: RuleFile[] = [
                { folder: 'js', name: 'rule1.mdc', path: '/path/to/js/rule1.mdc' },
                { folder: 'js', name: 'rule2.mdc', path: '/path/to/js/rule2.mdc' },
                { folder: 'rust', name: 'rule3.mdc', path: '/path/to/rust/rule3.mdc' }
            ];

            vi.mocked(inquirer.prompt).mockResolvedValueOnce({
                selectedFiles: [ruleFiles[0], ruleFiles[2]]
            });

            const result = await promptUserForRuleSelection(ruleFiles);

            expect(result).toEqual([ruleFiles[0], ruleFiles[2]]);
            expect(inquirer.prompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: 'checkbox',
                    name: 'selectedFiles',
                    message: 'Select rule files to pull:',
                    pageSize: 15
                })
            ]);
        });

        it('should group files by module with separators', async () => {
            const ruleFiles: RuleFile[] = [
                { folder: 'js', name: 'rule1.mdc', path: '/path/to/js/rule1.mdc' },
                { folder: 'rust', name: 'rule2.mdc', path: '/path/to/rust/rule2.mdc' }
            ];

            vi.mocked(inquirer.prompt).mockResolvedValueOnce({
                selectedFiles: []
            });

            await promptUserForRuleSelection(ruleFiles);

            const promptCall = vi.mocked(inquirer.prompt).mock.calls[0][0][0];
            const choices = promptCall.choices;

            // 修改验证方式
            expect(choices[0]).toEqual(expect.objectContaining({
                type: 'separator',
                line: expect.stringContaining('js')
            }));
            expect(choices[1]).toEqual({
                name: '📄 rule1.mdc',
                value: ruleFiles[0],
                short: 'rule1.mdc'
            });
            expect(choices[2].type).toBe('separator'); // 空行分隔符
            expect(choices[3]).toEqual(expect.objectContaining({
                type: 'separator',
                line: expect.stringContaining('rust')
            }));
            expect(choices[4]).toEqual({
                name: '📄 rule2.mdc',
                value: ruleFiles[1],
                short: 'rule2.mdc'
            });
        });

        it('should handle empty rule files list', async () => {
            vi.mocked(inquirer.prompt).mockResolvedValueOnce({
                selectedFiles: []
            });

            const result = await promptUserForRuleSelection([]);

            expect(result).toEqual([]);
            expect(inquirer.prompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    choices: []
                })
            ]);
        });
    });
}); 