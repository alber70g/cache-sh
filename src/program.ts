import { program as programCmd } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { cacheSh } from './cache-sh';

export function getVersionFromPackageJson() {
  const packageJson = readFileSync(
    path.join(__dirname, '../package.json'),
    'utf-8',
  ) as unknown as { version: string };
  return packageJson.version;
}

programCmd
  .name('cache-sh')
  .description('cacheSh is a command line tool for caching shell commands')
  .version(getVersionFromPackageJson());

programCmd
  .requiredOption(
    '-i, --input <input>',
    `glob that's used as input to check whether the existing files need to be updated`,
  )
  .option(
    '-C, --config <path>',
    'set the config path (default: "$PWD/.cache-sh")',
  )
  .option('-d, --cwd <path>', 'set the current working directory')
  .option('-f, --force', 'ignore the cache the command')
  .option('-c, --clear', 'clear the cache')
  .arguments('<command>')
  .action(cacheSh);

/**
 * cacheSh is a command line tool for caching shell commands
 *
 * Usage: cacheSh [options] [command]
 *
 * Options:
 * -o, --output   output files that need to exist for the cache to be valid
 * -i, --input    input to calculate the hash for the cache
 * -C, --config   set the config path (default: "cwd/.cacheSh")
 * -f, --force    ignore the cache the command
 * -c, --clear    clear the cache
 * -d, --cwd      set the current working directory
 * -V, --version  output the version number
 * -h, --help     display help for command
 *
 * Command: the command to execute and cache
 */
export const program = programCmd;

