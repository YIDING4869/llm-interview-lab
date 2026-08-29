import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const rootDir = process.cwd();
const publicBase = 'https://yiding4869.github.io/llm-interview-lab';

const [practiceSource, lessonSource, interviewSource] = await Promise.all([
  readFile(join(rootDir, 'data', 'practice.ts'), 'utf8'),
  readFile(join(rootDir, 'data', 'lessons.ts'), 'utf8'),
  readFile(join(rootDir, 'data', 'interviews.ts'), 'utf8'),
]);

const questionIds = [...practiceSource.matchAll(/^    id: (\d+),$/gm)].map((match) => match[1]);
const lessonIds = [...lessonSource.matchAll(/^    id: '([^']+)', moduleId:/gm)].map((match) => match[1]);
const interviewIds = [...interviewSource.matchAll(/^    id: '([^']+)',$/gm)].map((match) => match[1]);

const routes = [
  { path: '/', frequency: 'weekly', priority: '1.0' },
  { path: '/learn/', frequency: 'monthly', priority: '0.8' },
  { path: '/lessons/', frequency: 'monthly', priority: '0.9' },
  { path: '/practice/', frequency: 'weekly', priority: '0.9' },
  { path: '/labs/', frequency: 'monthly', priority: '0.8' },
  { path: '/resources/', frequency: 'monthly', priority: '0.8' },
  { path: '/interviews/', frequency: 'weekly', priority: '0.9' },
  ...lessonIds.map((id) => ({ path: `/lessons/${id}/`, frequency: 'monthly', priority: '0.8' })),
  ...questionIds.map((id) => ({ path: `/questions/${id}/`, frequency: 'monthly', priority: '0.8' })),
  ...interviewIds.map((id) => ({ path: `/interviews/${id}/`, frequency: 'monthly', priority: '0.7' })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map(({ path, frequency, priority }) => `  <url><loc>${publicBase}${path}</loc><changefreq>${frequency}</changefreq><priority>${priority}</priority></url>`),
  '</urlset>',
  '',
].join('\n');

await writeFile(join(rootDir, 'dist', 'client', 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap with ${routes.length} URLs.`);
