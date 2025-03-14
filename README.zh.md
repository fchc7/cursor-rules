# Cursor Rule

[![版本](https://img.shields.io/npm/v/@fchc8/cursor-rules.svg)](https://www.npmjs.com/package/@fchc8/cursor-rules)
[![测试覆盖率](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/fchc7/cursor-rules/main/coverage/coverage-summary.json&label=测试覆盖率&query=$.total.lines.pct&suffix=%&color=green)](https://github.com/fchc7/cursor-rules/actions)

[English Documentation](https://github.com/fchc7/cursor-rules?tab=readme-ov-file#cursor-rule)

## 项目简介

Cursor Rule 是一个命令行工具，用于将 Cursor 规则文件拉取到本地的 `.cursor/rules` 目录中。它帮助用户高效地管理和更新 Cursor 规则，使自定义 Cursor 编辑器体验变得更加简单。

## 功能特点

- 从 JavaScript、Rust 或通用模块中拉取特定规则文件
- 列出并选择模块以拉取所有文件
- 交互式选择规则文件
- 命令行选项快速选择模块
- 详细的成功和失败报告

## 安装方法

### 前提条件

- Node.js (v16.0.0 或更高版本)
- npm (v6.0.0 或更高版本)

### 通过 npm 安装

```bash
npm install -g @fchc8/cursor-rules
```

### 从源代码安装

```bash
git clone https://github.com/fchc7/cursor-rules.git
cd cursor-rules
npm install
npm link
```

## 使用方法

### 基本用法

```bash
pullrule [选项]
```

### 选项列表

- `-j, --js`: 拉取 JavaScript 规则
- `-r, --rust`: 拉取 Rust 规则
- `-c, --common`: 拉取通用规则
- `-l, --list`: 列出并选择要拉取所有文件的模块
- `-h, --help`: 显示帮助信息
- `-V, --version`: 显示版本信息

### 示例

1. 交互式拉取特定规则文件：
   ```bash
   pullrule
   ```
2. 交互式拉取 JavaScript 规则：
   ```bash
   pullrule --js
   ```
3. 拉取所选模块的所有文件：
   ```bash
   pullrule --list
   ```
4. 拉取所有 JavaScript 和通用规则：
   ```bash
   pullrule --js --common --list
   ```

## 许可证

本项目采用 [MIT 许可证](LICENSE)。
