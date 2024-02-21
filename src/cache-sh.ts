import { createHash } from 'crypto';
import _debug from 'debug';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import path from 'path';
import { createRunCommand } from './utils/createRunCommand';
import { getGitHashForFiles } from './utils/getGitHashForFiles';
import { isGitInstalledOrThrow } from './utils/isGitInstalled';

const debug = _debug('cache-sh:root');

export async function cacheSh(
  command: string[],
  args: {
    input: string;
    output?: string;
    cwd?: string;
    config?: string;
    force?: boolean;
    clear?: boolean;
  },
) {
  try {
    args.force = args.force
      ? args.force
      : process.argv.includes('-f') || process.argv.includes('--force');
  } catch (e) {
    // ignore error
  }

  args.cwd = args.cwd || process.cwd();
  debug('arguments', args);
  const cmd = command.join(' ');

  if (args.clear) {
    debug('clearing cache');
    console.log('Clearing cache...');
    // - clear cache
    writeFileSync(path.join(args.cwd.trim(), '.cache-sh'), '{}');
    process.exit(0);
  }

  args.config = args.config || path.join(args.cwd.trim(), '.cache-sh');

  // - expand `args.input` glob to files
  const getFilePaths = () =>
    globSync(args.input, { follow: true, nodir: true });

  const filePaths = getFilePaths();
  debug('filePaths', filePaths);

  debug('checking if git is installed');
  // - check if git is installed
  isGitInstalledOrThrow();
  debug('git is installed');

  // - get hash of files
  const hashBefore = await getGitHashForFiles(filePaths);
  debug('hash of filePaths', filePaths, '\nbefore execution', hashBefore);

  debug(`creating hashKey \`${cmd + args.input}\``);
  const hashKey = createHash('sha1')
    .update(cmd + args.input)
    .digest('base64');

  debug('hashKey', hashKey);

  // - check if hash exists in cache (./.cache-sh)
  let cacheData = {} as { [key: string]: string } | void;
  debug('using cache path', args.config);

  const runCommand = createRunCommand(cmd, args.cwd);

  cacheData = getCacheData(args.config);

  if (args.force || cacheData === undefined || filePaths.length === 0) {
    debug(
      'force=true, or cache does not exist, or no matching files: executing command',
    );
    debug(`executing command \`${cmd}\``);
    // Run command
    await runCommand();
    debug('command executed');

    const filePaths = getFilePaths();
    debug('filePaths', filePaths);

    const hashAfter = await getGitHashForFiles(filePaths);
    debug('hash of filePaths after execution', hashAfter);

    debug(
      'writing cache',
      args.config,
      JSON.stringify({ [hashKey]: hashAfter }, null, 2),
    );
    // Save hash to cache
    writeFileSync(
      args.config,
      JSON.stringify({ [hashKey]: hashAfter }, null, 2),
    );
  } else {
    debug('valid cache exists, reading cache');

    debug('cacheData', cacheData);

    if (cacheData[hashKey] && cacheData[hashKey] === hashBefore) {
      debug(
        'cache hit, skipping... based on',
        hashKey,
        cacheData[hashKey],
        hashBefore,
      );
      console.log('Cache hit, skipping...');
    } else {
      debug('cache miss, executing command: ', cmd);
      await runCommand();

      const filePaths = getFilePaths();
      debug('filePaths', filePaths);

      const hashAfter = await getGitHashForFiles(filePaths);
      debug('hash of filePaths after execution', hashAfter);

      debug(
        'writing cache',
        args.config,
        JSON.stringify({ ...cacheData, [hashKey]: hashAfter }, null, 2),
      );
      // Save hash to cache
      writeFileSync(
        args.config,
        JSON.stringify({ ...cacheData, [hashKey]: hashAfter }, null, 2),
      );
    }
  }
}

function getCacheData(config: string): { [key: string]: string } | void {
  if (existsSync(config)) {
    try {
      return JSON.parse(readFileSync(config, 'utf8').toString());
    } catch (e) {
      unlinkSync(config);
    }
  }
  return;
}
