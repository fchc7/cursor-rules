import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { getRulesDir, getRuleFolders, getRuleFiles } from '../../src/utils/fileUtils';

// 模拟 fs 模块
vi.mock('fs/promises', () => ({
    default: {
        readdir: vi.fn(),
        access: vi.fn().mockResolvedValue(undefined)
    }
}));

// 模拟 process.env
const originalEnv = process.env;

describe('fileUtils', () => {
    beforeEach(() => {
        // 重置所有模拟
        vi.resetAllMocks();
        // 重置环境变量
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        // 恢复环境变量
        process.env = originalEnv;
    });

    describe('getRulesDir', () => {
        it('should return development path when NODE_ENV is not production', () => {
            process.env.NODE_ENV = 'development';
            const result = getRulesDir();
            expect(result).toBe(path.resolve(process.cwd(), 'rules'));
        });

        it('should return production path when NODE_ENV is production', () => {
            process.env.NODE_ENV = 'production';
            const result = getRulesDir();
            // 注意：这个测试可能会因为 __dirname 的值而变化
            expect(result).toContain(path.join('rules'));
        });
    });

    describe('getRuleFolders', () => {
        it('should return folder names when directories exist', async () => {
            const mockDirs = [
                { name: 'js', isDirectory: () => true },
                { name: 'rust', isDirectory: () => true },
                { name: 'file.txt', isDirectory: () => false }
            ];

            vi.mocked(fs.readdir).mockResolvedValue(mockDirs as any);

            const result = await getRuleFolders();

            expect(result).toEqual(['js', 'rust']);
            expect(fs.readdir).toHaveBeenCalledWith(expect.stringContaining('rules'), { withFileTypes: true });
        });

        it('should use custom base directory when provided', async () => {
            const mockDirs = [
                { name: 'js', isDirectory: () => true }
            ];

            vi.mocked(fs.readdir).mockResolvedValue(mockDirs as any);

            const customDir = '/custom/path';
            await getRuleFolders(customDir);

            expect(fs.readdir).toHaveBeenCalledWith(path.join(customDir, 'rules'), { withFileTypes: true });
        });

        it('should return empty array when error occurs', async () => {
            vi.mocked(fs.readdir).mockRejectedValue(new Error('Directory not found'));

            const result = await getRuleFolders();

            expect(result).toEqual([]);
        });
    });

    describe('getRuleFiles', () => {
        it('should return rule files from specified modules', async () => {
            // 确保 access 调用成功
            vi.mocked(fs.access).mockResolvedValue(undefined);

            // 模拟第一个模块的文件
            vi.mocked(fs.readdir).mockResolvedValueOnce([
                'rule1.mdc', 'rule2.mdc', 'other.txt'
            ] as any);

            // 模拟第二个模块的文件
            vi.mocked(fs.readdir).mockResolvedValueOnce([
                'rule3.mdc'
            ] as any);

            const modules = ['js', 'rust'];
            const result = await getRuleFiles(modules);

            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({
                folder: 'js',
                name: 'rule1.mdc',
                path: expect.stringContaining(path.join('js', 'rule1.mdc'))
            });
            expect(result[1]).toEqual({
                folder: 'js',
                name: 'rule2.mdc',
                path: expect.stringContaining(path.join('js', 'rule2.mdc'))
            });
            expect(result[2]).toEqual({
                folder: 'rust',
                name: 'rule3.mdc',
                path: expect.stringContaining(path.join('rust', 'rule3.mdc'))
            });
        });

        it('should handle non-existent modules', async () => {
            // 模拟模块不存在
            vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));

            const modules = ['non-existent'];
            const result = await getRuleFiles(modules);

            expect(result).toEqual([]);
        });

        it('should handle errors when reading module contents', async () => {
            // 模拟访问成功但读取失败
            vi.mocked(fs.access).mockResolvedValueOnce(undefined);
            vi.mocked(fs.readdir).mockRejectedValueOnce(new Error('Permission denied'));

            const modules = ['js'];
            const result = await getRuleFiles(modules);

            expect(result).toEqual([]);
        });

        it('should use custom base directory when provided', async () => {
            vi.mocked(fs.readdir).mockResolvedValueOnce(['rule1.mdc'] as any);

            const customDir = '/custom/path';
            const modules = ['js'];
            await getRuleFiles(modules, customDir);

            expect(fs.access).toHaveBeenCalledWith(path.join(customDir, 'rules', 'js'));
        });

        it('should handle errors when getting rule files', async () => {
            // 模拟顶层错误
            vi.mocked(fs.access).mockRejectedValueOnce(new Error('Unknown error'));

            const modules = ['js'];
            const result = await getRuleFiles(modules);

            expect(result).toEqual([]);
        });
    });
}); 