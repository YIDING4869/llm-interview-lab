import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const clientDir = join(process.cwd(), 'dist', 'client');

for (const route of ['learn', 'practice', 'resources']) {
  const routeDir = join(clientDir, route);
  await mkdir(routeDir, { recursive: true });
  await copyFile(join(clientDir, `${route}.html`), join(routeDir, 'index.html'));
}
