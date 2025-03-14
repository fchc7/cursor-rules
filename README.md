# Cursor Rule

[![Version](https://img.shields.io/npm/v/@fchc8/cursor-rules.svg)](https://www.npmjs.com/package/@fchc8/cursor-rules)
[![Test Coverage](https://codecov.io/gh/fchc7/cursor-rules/branch/main/graph/badge.svg)](https://codecov.io/gh/fchc7/cursor-rules)

[中文文档](https://github.com/fchc7/cursor-rules/blob/main/README.zh.md)

## Introduction

Cursor Rule is a command-line tool for pulling Cursor rule files to your local `.cursor/rules` directory. It helps users manage and update their Cursor rules efficiently, making it easier to customize your Cursor editor experience.

## Features

- Pull specific rule files from JavaScript, Rust, or common modules
- List and select modules to pull all files from
- Interactive selection of rule files
- Command-line options for quick selection of modules
- Detailed success and failure reporting

## Installation

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v6.0.0 or higher)

### Install via npm

```bash
npm install -g  @fchc8/cursor-rules
```

### Install from source

```bash
git clone https://github.com/fchc7/cursor-rules.git
cd cursor-rules
npm install
npm link
```

## Usage

### Basic Usage

```bash
pullrule [options]
```

### Options

- `-j, --js`: Pull JavaScript rules
- `-r, --rust`: Pull Rust rules
- `-c, --common`: Pull common rules
- `-l, --list`: List and select modules to pull all files from
- `-h, --help`: Display help information
- `-V, --version`: Display version information

### Examples

1. Pull specific rule files interactively:
   ```bash
   pullrule
   ```
2. Pull JavaScript rules interactively:
   ```bash
   pullrule --js
   ```
3. Pull all files from selected modules:
   ```bash
   pullrule --list
   ```
4. Pull all JavaScript and common rules:
   ```bash
   pullrule --js --common --list
   ```

## License

This project is licensed under the [MIT License](LICENSE).
