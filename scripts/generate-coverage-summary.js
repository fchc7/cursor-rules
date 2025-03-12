#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read coverage-final.json file
const coveragePath = path.join(__dirname, "../coverage/coverage-final.json");
const outputPath = path.join(__dirname, "../coverage/coverage-summary.json");

try {
  // Read coverage data
  const coverageData = require(coveragePath);

  // Initialize summary data
  const summary = {
    total: {
      lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
    },
  };

  // Process coverage data for each file
  Object.keys(coverageData).forEach((filePath) => {
    const fileData = coverageData[filePath];
    const fileName = path.relative(path.join(__dirname, ".."), filePath);

    // Initialize file summary data
    summary[fileName] = {
      lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
    };

    // Calculate statement coverage
    const stmtTotal = Object.keys(fileData.statementMap).length;
    const stmtCovered = Object.values(fileData.s).filter((v) => v > 0).length;
    const stmtPct = stmtTotal === 0 ? 100 : (stmtCovered / stmtTotal) * 100;

    summary[fileName].statements.total = stmtTotal;
    summary[fileName].statements.covered = stmtCovered;
    summary[fileName].statements.pct = stmtPct;
    summary.total.statements.total += stmtTotal;
    summary.total.statements.covered += stmtCovered;

    // Calculate line coverage (using statement coverage as an approximation)
    summary[fileName].lines = { ...summary[fileName].statements };
    summary.total.lines.total += stmtTotal;
    summary.total.lines.covered += stmtCovered;

    // Calculate function coverage
    const fnTotal = Object.keys(fileData.fnMap).length;
    const fnCovered = Object.values(fileData.f).filter((v) => v > 0).length;
    const fnPct = fnTotal === 0 ? 100 : (fnCovered / fnTotal) * 100;

    summary[fileName].functions.total = fnTotal;
    summary[fileName].functions.covered = fnCovered;
    summary[fileName].functions.pct = fnPct;
    summary.total.functions.total += fnTotal;
    summary.total.functions.covered += fnCovered;

    // Calculate branch coverage
    const brTotal = Object.keys(fileData.branchMap).length;
    const brCovered = Object.values(fileData.b).filter((v) => v > 0).length;
    const brPct = brTotal === 0 ? 100 : (brCovered / brTotal) * 100;

    summary[fileName].branches.total = brTotal;
    summary[fileName].branches.covered = brCovered;
    summary[fileName].branches.pct = brPct;
    summary.total.branches.total += brTotal;
    summary.total.branches.covered += brCovered;
  });

  // Calculate overall percentages
  summary.total.statements.pct =
    summary.total.statements.total === 0
      ? 100
      : (summary.total.statements.covered / summary.total.statements.total) *
        100;

  summary.total.lines.pct =
    summary.total.lines.total === 0
      ? 100
      : (summary.total.lines.covered / summary.total.lines.total) * 100;

  summary.total.functions.pct =
    summary.total.functions.total === 0
      ? 100
      : (summary.total.functions.covered / summary.total.functions.total) * 100;

  summary.total.branches.pct =
    summary.total.branches.total === 0
      ? 100
      : (summary.total.branches.covered / summary.total.branches.total) * 100;

  // Write summary file
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`Coverage summary file generated: ${outputPath}`);
} catch (error) {
  console.error("Failed to generate coverage summary file:", error);
  process.exit(1);
}
