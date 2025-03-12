#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// 读取 package.json 获取版本号
const packageJson = require("../package.json");
const version = packageJson.version;

// 尝试读取测试覆盖率报告
let coverage = "0";
try {
  const coverageSummary = require("../coverage/coverage-summary.json");
  coverage = Math.round(coverageSummary.total.lines.pct);
} catch (error) {
  console.warn("无法读取测试覆盖率报告，使用默认值 0");
}

// 更新 README.md
function updateReadme(filePath, isZh = false) {
  if (!fs.existsSync(filePath)) {
    console.warn(`文件 ${filePath} 不存在`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // 更新版本号徽章
  if (isZh) {
    content = content.replace(
      /\[\!\[版本\]\(https:\/\/img\.shields\.io\/badge\/版本-[\d\.]*-blue\.svg\)\]/,
      `[![版本](https://img.shields.io/badge/版本-${version}-blue.svg)]`
    );
    content = content.replace(
      /\[\!\[测试覆盖率\]\(https:\/\/img\.shields\.io\/badge\/测试覆盖率-\d*%25-green\.svg\)\]/,
      `[![测试覆盖率](https://img.shields.io/badge/测试覆盖率-${coverage}%25-green.svg)]`
    );
  } else {
    content = content.replace(
      /\[\!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[\d\.]*-blue\.svg\)\]/,
      `[![Version](https://img.shields.io/badge/version-${version}-blue.svg)]`
    );
    content = content.replace(
      /\[\!\[Test Coverage\]\(https:\/\/img\.shields\.io\/badge\/coverage-\d*%25-green\.svg\)\]/,
      `[![Test Coverage](https://img.shields.io/badge/coverage-${coverage}%25-green.svg)]`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`已更新 ${filePath}`);
}

// 更新英文和中文 README
updateReadme(path.join(__dirname, "../README.md"));
updateReadme(path.join(__dirname, "../README.zh.md"), true);

console.log("README 徽章更新完成！");
