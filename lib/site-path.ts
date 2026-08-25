const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function sitePath(path: string) {
  if (path === '/') return `${publicBasePath}/`;
  return `${publicBasePath}${path}`;
}
