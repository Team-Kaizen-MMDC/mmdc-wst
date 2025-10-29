#!/usr/bin/env node
/**
 * Generate usability test summary for PR comments
 * Combines accessibility (axe-core) and keyboard navigation test results
 */

const fs = require("fs");
const path = require("path");

function safeRead(filePath) {
  try {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  } catch (err) {
    return null;
  }
}

function parseAxeResults() {
  const resultsDir = path.join(process.cwd(), "tests/accessibility/results");
  const results = {
    total: 0,
    violations: 0,
    passes: 0,
    incomplete: 0,
    pages: [],
  };

  if (!fs.existsSync(resultsDir)) {
    return results;
  }

  const files = fs
    .readdirSync(resultsDir)
    .filter((f) => f.endsWith("-axe.json"));

  for (const file of files) {
    const filePath = path.join(resultsDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (data.axe) {
        const pageName = file.replace("-axe.json", "");
        const axe = data.axe;
        results.total++;
        results.violations += axe.violations?.length || 0;
        results.passes += axe.passes?.length || 0;
        results.incomplete += axe.incomplete?.length || 0;

        results.pages.push({
          name: pageName,
          url: data.url,
          violations: axe.violations || [],
          passes: axe.passes?.length || 0,
          incomplete: axe.incomplete?.length || 0,
        });
      }
    } catch (err) {
      console.error(`Error parsing ${file}:`, err.message);
    }
  }

  return results;
}

function parsePlaywrightResults() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: [],
  };

  // Try to find JSON reporter output
  const reporterPaths = [
    "test-results/results.json",
    "tests/playwright/test-results/results.json",
  ];

  for (const reportPath of reporterPaths) {
    const fullPath = path.join(process.cwd(), reportPath);
    if (fs.existsSync(fullPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
        if (data.suites) {
          // Playwright JSON format
          results.total = data.stats?.expected || 0;
          results.passed = data.stats?.expected || 0;
          results.failed = data.stats?.unexpected || 0;
          results.skipped = data.stats?.skipped || 0;
        }
        return results;
      } catch (err) {
        console.error(`Error parsing ${reportPath}:`, err.message);
      }
    }
  }

  return results;
}

function formatSummary(axeResults, playwrightResults) {
  const lines = [];

  lines.push("## 🎯 Usability Test Results\n");

  // Overall status badge
  const hasViolations = axeResults.violations > 0;
  const hasFailures = playwrightResults.failed > 0;
  const overallStatus = !hasViolations && !hasFailures ? "✅ PASS" : "❌ FAIL";

  lines.push(`### ${overallStatus}\n`);

  // Accessibility Results
  lines.push("### ♿ Accessibility Tests (axe-core)\n");

  if (axeResults.total === 0) {
    lines.push("⚠️ No accessibility test results found.\n");
  } else {
    lines.push(`- **Pages Tested:** ${axeResults.total}`);
    lines.push(
      `- **Violations:** ${axeResults.violations} ${
        axeResults.violations === 0 ? "✅" : "❌"
      }`
    );
    lines.push(`- **Passes:** ${axeResults.passes} ✅`);
    lines.push(`- **Incomplete:** ${axeResults.incomplete}`);
    lines.push("");

    // Detailed violations by page
    if (axeResults.violations > 0) {
      lines.push("#### 🚨 Violations by Page\n");

      for (const page of axeResults.pages) {
        if (page.violations.length > 0) {
          lines.push(
            `**${page.name}** (${page.violations.length} violation${
              page.violations.length !== 1 ? "s" : ""
            })`
          );

          for (const violation of page.violations) {
            lines.push(
              `- **${violation.impact?.toUpperCase() || "UNKNOWN"}**: ${
                violation.help
              }`
            );
            lines.push(`  - ${violation.description}`);
            lines.push(
              `  - Affects ${violation.nodes?.length || 0} element${
                violation.nodes?.length !== 1 ? "s" : ""
              }`
            );

            if (violation.nodes && violation.nodes.length > 0) {
              const firstNode = violation.nodes[0];
              if (firstNode.html) {
                lines.push(
                  `  - Example: \`${firstNode.html.substring(0, 100)}${
                    firstNode.html.length > 100 ? "..." : ""
                  }\``
                );
              }
            }
          }
          lines.push("");
        }
      }
    } else {
      lines.push("#### ✅ All Pages Pass\n");
      for (const page of axeResults.pages) {
        lines.push(`- **${page.name}**: ${page.passes} checks passed`);
      }
      lines.push("");
    }
  }

  // Keyboard Navigation Results
  lines.push("### ⌨️ Keyboard Navigation Tests\n");

  if (playwrightResults.total === 0) {
    lines.push("⚠️ No keyboard navigation test results found.\n");
  } else {
    lines.push(`- **Tests Run:** ${playwrightResults.total}`);
    lines.push(`- **Passed:** ${playwrightResults.passed} ✅`);
    lines.push(
      `- **Failed:** ${playwrightResults.failed} ${
        playwrightResults.failed === 0 ? "✅" : "❌"
      }`
    );
    lines.push(`- **Skipped:** ${playwrightResults.skipped}`);
    lines.push("");
  }

  // Summary metrics
  lines.push("### 📊 Summary\n");
  lines.push("| Metric | Result |");
  lines.push("|--------|--------|");
  lines.push(`| Accessibility Violations | ${axeResults.violations} |`);
  lines.push(`| Pages Tested | ${axeResults.total} |`);
  lines.push(
    `| Keyboard Tests Passed | ${playwrightResults.passed}/${playwrightResults.total} |`
  );

  const score = calculateUsabilityScore(axeResults, playwrightResults);
  lines.push(
    `| **Usability Score** | **${score}%** ${
      score >= 90 ? "🎉" : score >= 70 ? "⚠️" : "❌"
    } |`
  );
  lines.push("");

  // Next steps
  if (hasViolations || hasFailures) {
    lines.push("### 🔧 Next Steps\n");
    if (hasViolations) {
      lines.push("1. Review accessibility violations above");
      lines.push("2. Fix high-impact issues first (CRITICAL, SERIOUS)");
      lines.push("3. Test with screen readers (NVDA, JAWS, VoiceOver)");
    }
    if (hasFailures) {
      lines.push("1. Review failed keyboard navigation tests");
      lines.push("2. Ensure all interactive elements are keyboard accessible");
      lines.push("3. Verify focus indicators are visible");
    }
    lines.push("");
  }

  lines.push("---");
  lines.push(
    "*Generated by automated usability tests. [View full results](.)*"
  );

  return lines.join("\n");
}

function calculateUsabilityScore(axeResults, playwrightResults) {
  let score = 100;

  // Deduct points for accessibility violations
  const violationPenalty = Math.min(axeResults.violations * 10, 50);
  score -= violationPenalty;

  // Deduct points for failed keyboard tests
  if (playwrightResults.total > 0) {
    const failRate = playwrightResults.failed / playwrightResults.total;
    score -= failRate * 50;
  }

  return Math.max(0, Math.round(score));
}

// Main execution
try {
  const axeResults = parseAxeResults();
  const playwrightResults = parsePlaywrightResults();

  const summary = formatSummary(axeResults, playwrightResults);

  // Write to file
  const outputPath = path.join(process.cwd(), "usability-summary.md");
  fs.writeFileSync(outputPath, summary);

  console.log("✅ Usability summary generated:", outputPath);
  console.log("\n--- Summary Preview ---");
  console.log(summary);

  // Exit with error code if there are violations or failures
  const hasIssues = axeResults.violations > 0 || playwrightResults.failed > 0;
  process.exit(hasIssues ? 1 : 0);
} catch (err) {
  console.error("❌ Error generating usability summary:", err);
  process.exit(1);
}
