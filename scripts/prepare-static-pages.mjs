import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';

const clientDir = join(process.cwd(), 'dist', 'client');

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(entryPath));
    else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html') files.push(entryPath);
  }
  return files;
}

for (const htmlFile of await collectHtmlFiles(clientDir)) {
  const routePath = relative(clientDir, htmlFile).replace(/\.html$/, '');
  const targetFile = join(clientDir, routePath, 'index.html');
  await mkdir(dirname(targetFile), { recursive: true });
  await copyFile(htmlFile, targetFile);
}

console.log(`Mirrored ${basename(clientDir)} HTML routes to folder index files.`);
