import { createHash } from 'crypto';
import _debug from 'debug';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import path from 'path';
import { createRunCommand } from './utils/createRunCommand';
import { getGitHashForFiles } from './utils/getGitHashForFiles';
import { isGitInstalledOrThrow } from './utils/isGitInstalled';

const debug = _debug('cache-sh:root');

export async function cacheSh(
  command: string,
  args: {
    input: string;
    output?: string;
    cwd?: string;
    config?: string;
    force?: boolean;
    clear?: boolean;
  },
) {
  args.cwd = args.cwd || process.cwd();
  debug('arguments', args);

  if (args.clear) {
    debug('clearing cache');
    console.log('Clearing cache...');
    // - clear cache
    writeFileSync(path.join(args.cwd.trim(), '.cache-sh'), '{}');
  }

  // - expand `args.input` glob to files
  const filePaths = globSync(args.input);
  debug('filePaths', filePaths);

  if (!filePaths.length) {
    console.error('no files found for glob:', args.input);
    process.exit(1);
  }

  debug('checking if git is installed');
  // - check if git is installed
  isGitInstalledOrThrow();
  debug('git is installed');

  // - get hash of files
  const hashBefore = await getGitHashForFiles(filePaths);
  debug('hash of filePaths', filePaths, 'before execution', hashBefore);

  const hashKey = createHash('sha1')
    .update(command + filePaths.join(''))
    .digest('base64');

  debug('hashKey', hashKey);

  // - check if hash exists in cache (./.cache-sh)
  const cachePath = path.join(args.cwd.trim(), '.cache-sh');
  let cacheData = {} as { [key: string]: string };
  debug('using cache path', cachePath);

  const runCommand = createRunCommand(command, args.cwd);

  if (args.force || !existsSync(cachePath)) {
    debug('force===true, or cache does not exist, executing command');
    debug('executing command', command);
    // Run command
    await runCommand();
    debug('command executed');

    const hashAfter = await getGitHashForFiles(filePaths);
    debug('hash of filePaths after execution', hashAfter);

    debug(
      'writing cache',
      cachePath,
      JSON.stringify({ [hashKey]: hashAfter }, null, 2),
    );
    // Save hash to cache
    writeFileSync(cachePath, JSON.stringify({ [hashKey]: hashAfter }, null, 2));
  } else {
    debug('cache exists, reading cache');

    const cacheContent = readFileSync(cachePath, 'utf-8');
    cacheData = JSON.parse(cacheContent);
    debug('cacheData', cacheData);

    if (cacheData[hashKey] && cacheData[hashKey] === hashBefore) {
      debug('cache hit, skipping... based on', cacheData[hashKey], hashBefore);
      console.log('Cache hit, skipping...');
    } else {
      debug('cache miss, executing command: ', command);
      await runCommand();

      const hashAfter = await getGitHashForFiles(filePaths);
      debug('hash of filePaths after execution', hashAfter);

      debug(
        'writing cache',
        cachePath,
        JSON.stringify({ ...cacheData, [hashKey]: hashAfter }, null, 2),
      );
      // Save hash to cache
      writeFileSync(
        cachePath,
        JSON.stringify({ ...cacheData, [hashKey]: hashAfter }, null, 2),
      );
    }
  }
}
