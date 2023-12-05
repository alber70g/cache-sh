import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import path from 'path';
import glob from 'glob';
import { getGitHashForFiles } from './utils/getGitHashForFiles';

export function cacheSh(
  command: string,
  args: { input: string; config?: string; force?: boolean; clear?: boolean }
) {
  // - expand `args.input` glob to files
  const filePaths = glob.sync(args.input);

  // - get hash of files
  const hash = getGitHashForFiles(...filePaths);

  // - check if hash exists in cache (./.cacheSh)
  const cachePath = path.join(process.cwd(), '.cacheSh');
  const cacheExists = existsSync(cachePath);
  let cacheHash = '';

  if (cacheExists) {
    const cacheContent = readFileSync(cachePath, 'utf-8');
    const cacheData = JSON.parse(cacheContent);
    cacheHash = cacheData.hash;
  }

  // - if exists, check if different hash, if different, run command, if same, use cache, save hash to cache
  if (cacheExists && cacheHash !== hash) {
    // Run command
    execSync(command);
    // Save hash to cache
    const cacheData = { hash };
    writeFileSync(cachePath, JSON.stringify(cacheData));
  } else {
    // Use cache
    console.log('Using cache');
  }

  // - if not exists, run command and save hash to cache
  if (!cacheExists) {
    // Run command
    execSync(command);
    // Save hash to cache
    const cacheData = { hash };
    writeFileSync(cachePath, JSON.stringify(cacheData));
  }
}
