import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = "C:\\Secracy";
const outputDir = path.join(repoRoot, "native-web");
const vendorDir = path.join(outputDir, "vendor", "bootstrap");

const filesToCopy = [
    "snake.html",
    "snake-game.mjs",
    "snake-logic.mjs",
    "snake-sw.js",
    "snake.webmanifest",
    "snake-icon.svg",
    "snake-maskable.svg"
];

async function main() {
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.mkdir(vendorDir, { recursive: true });

    await Promise.all(filesToCopy.map(copyToOutput));
    await copyBootstrap();
    await writeIndexRedirect();
}

async function copyToOutput(fileName) {
    await fs.copyFile(path.join(repoRoot, fileName), path.join(outputDir, fileName));
}

async function copyBootstrap() {
    await fs.copyFile(
        path.join(repoRoot, "vendor", "bootstrap", "bootstrap.min.css"),
        path.join(vendorDir, "bootstrap.min.css")
    );

    await fs.copyFile(
        path.join(repoRoot, "vendor", "bootstrap", "bootstrap.bundle.min.js"),
        path.join(vendorDir, "bootstrap.bundle.min.js")
    );
}

async function writeIndexRedirect() {
    const contents = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=./snake.html">
  <title>Secracy Snake</title>
</head>
<body></body>
</html>
`;

    await fs.writeFile(path.join(outputDir, "index.html"), contents, "utf8");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
