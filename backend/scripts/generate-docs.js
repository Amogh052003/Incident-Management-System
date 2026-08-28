const fs = require("fs");
const path = require("path");
const jsdoc2md = require("jsdoc-to-markdown");

const ROOT_DIR = path.join(__dirname, "..");
const SOURCE_DIR = path.join(ROOT_DIR, "src");
const OUTPUT_DIR = path.join(ROOT_DIR, "docs", "reference");

/**
 * Recursively finds JavaScript source files.
 *
 * @param {string} directory - Directory to scan.
 * @returns {string[]} JavaScript source files.
 */
function findJavaScriptFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...findJavaScriptFiles(fullPath));
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(".js")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Converts a source file path into the corresponding Markdown path.
 *
 * Example:
 *
 * src/services/auditService.js
 * ->
 * docs/reference/services/auditService.md
 *
 * @param {string} sourceFile - Absolute source file path.
 * @returns {string} Absolute Markdown output path.
 */
function getOutputPath(sourceFile) {
  const relativePath = path.relative(
    SOURCE_DIR,
    sourceFile
  );

  return path.join(
    OUTPUT_DIR,
    relativePath.replace(/\.js$/, ".md")
  );
}

/**
 * Removes previously generated Markdown files.
 */
function cleanGeneratedDocumentation() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    return;
  }

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);

        if (fs.readdirSync(fullPath).length === 0) {
          fs.rmdirSync(fullPath);
        }

        continue;
      }

      if (!entry.name.endsWith(".md")) {
        continue;
      }

      const content = fs.readFileSync(
        fullPath,
        "utf8"
      );

      if (
        content.includes(
          "generator: docs-as-code-demo"
        )
      ) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  walk(OUTPUT_DIR);
}

/**
 * Generates Markdown documentation for a single JavaScript file.
 *
 * @param {string} sourceFile - Absolute source file path.
 * @returns {boolean} Whether useful documentation was generated.
 */
async function generateDocumentation(sourceFile) {
  const relativeSource = path
    .relative(ROOT_DIR, sourceFile)
    .replace(/\\/g, "/");

  const markdown = await jsdoc2md.render({
    files: sourceFile,
  });

  // No JSDoc content means there is nothing useful to publish.
  if (!markdown.trim()) {
    return false;
  }

  const title = path.basename(sourceFile, ".js");

  const output = `---
title: ${title}
generated: true
source: ${relativeSource}
generator: docs-as-code-demo
---

# ${title}

${markdown.trim()}
`;

  const outputFile = getOutputPath(sourceFile);

  fs.mkdirSync(path.dirname(outputFile), {
    recursive: true,
  });

  fs.writeFileSync(outputFile, output, "utf8");

  console.log(
    `Generated: ${path.relative(ROOT_DIR, outputFile)}`
  );

  return true;
}

/**
 * Generates documentation for the repository.
 */

async function main() {
  console.log("Starting JSDoc documentation generation...");

  const requestedFiles = process.argv.slice(2);

  let files;

  if (requestedFiles.length > 0) {
    // Incremental generation:
    // generate only the files explicitly supplied by CI.
    files = requestedFiles.map((file) =>
      path.resolve(ROOT_DIR, file)
    );
  } else {
    // Full generation:
    // clean previously generated documentation first,
    // then regenerate everything.
    cleanGeneratedDocumentation();

    files = findJavaScriptFiles(SOURCE_DIR);
  }

  let generated = 0;

  for (const sourceFile of files) {
    if (!sourceFile.startsWith(SOURCE_DIR)) {
      console.warn(
        `Skipping file outside src/: ${sourceFile}`
      );
      continue;
    }

    const relativeSource = path
      .relative(SOURCE_DIR, sourceFile)
      .replace(/\\/g, "/");

    // API routes are handled by OpenAPI.
    if (relativeSource.startsWith("api/")) {
      continue;
    }

    // Source file may have been deleted.
    if (!fs.existsSync(sourceFile)) {
      console.log(
        `Source file no longer exists, skipping: ${sourceFile}`
      );
      continue;
    }

    if (await generateDocumentation(sourceFile)) {
      generated++;
    }
  }

  console.log(
    `Generated ${generated} documentation files.`
  );
}