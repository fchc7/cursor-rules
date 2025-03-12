#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read package.json to get version
const packageJson = require("../package.json");
const version = packageJson.version;

// Try to read test coverage report
let coverage = "0";
try {
  const coverageSummary = require("../coverage/coverage-summary.json");
  coverage = Math.round(coverageSummary.total.lines.pct);
} catch (error) {
  console.warn("Unable to read coverage report, using default value 0");
}

// Update README.md
function updateReadme(filePath, isZh = false) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${filePath} does not exist`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Update version badge
  if (isZh) {
    content = content.replace(
      /\[\!\[版本\]\(https:\/\/img\.shields\.io\/badge\/版本-[\d\.]*-blue\.svg\)\]/,
      `[![Version](https://img.shields.io/badge/version-${version}-blue.svg)]`
    );
    content = content.replace(
      /\[\!\[测试覆盖率\]\(https:\/\/img\.shields\.io\/badge\/测试覆盖率-\d*%25-green\.svg\)\]/,
      `[![Test Coverage](https://img.shields.io/badge/coverage-${coverage}%25-green.svg)]`
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
  console.log(`Updated ${filePath}`);
}

// Update English and Chinese README
updateReadme(path.join(__dirname, "../README.md"));
updateReadme(path.join(__dirname, "../README.zh.md"), true);

console.log("README badges update completed!");
