import { exec } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import path from 'path';
import { getGitHashForFiles } from './utils/getGitHashForFiles';
import { isGitInstalledOrThrow } from './utils/isGitInstalled';

export async function cacheSh(
  command: string,
  args: {
    input: string;
    cwd?: string;
    config?: string;
    force?: boolean;
    clear?: boolean;
  },
  execSyncOptions: any = { stdio: 'inherit' },
) {
  args.cwd = args.cwd || process.cwd();

  // - expand `args.input` glob to files
  const filePaths = globSync(args.input);

  // - check if git is installed
  isGitInstalledOrThrow();

  // - get hash of files
  const hash = getGitHashForFiles(...filePaths);

  // - check if hash exists in cache (./.cache-sh)
  const cachePath = path.join(args.cwd.trim(), '.cache-sh');
  let cacheData = {} as { [key: string]: string };

  if (existsSync(cachePath)) {
    const cacheContent = readFileSync(cachePath, 'utf-8');
    cacheData = JSON.parse(cacheContent);
    if (cacheData[command] && cacheData[command] === hash) {
      console.log('Cache hit, skipping...');
    } else {
      await exec(command, execSyncOptions);
      // Save hash to cache
      writeFileSync(
        cachePath,
        JSON.stringify({ ...cacheData, [command]: hash }, null, 2),
      );
    }
  } else {
    // cache doesn't exist, run command and save hash to cache
    // Run command
    await exec(command, execSyncOptions);

    // Save hash to cache
    writeFileSync(cachePath, JSON.stringify({ [command]: hash }, null, 2));
  }
}
