import { readFileSync } from 'fs';
import path from 'path';

export function getVersionFromPackageJson() {
  const packageJson = readFileSync(
    path.join(__dirname, '../package.json'),
    'utf-8'
  ) as unknown as { version: string };
  return packageJson.version;
}
