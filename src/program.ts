import { program as programCmd } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { cacheSh } from './cache-sh';

export function getVersionFromPackageJson() {
  const packageJson = JSON.parse(
    readFileSync(path.join(__dirname, '../package.json'), 'utf-8'),
  ) as unknown as { version: string };
  return packageJson.version;
}

programCmd
  .name('cache-sh')
  .description(
    `  cache-sh: a command line tool for memoizing shell commands based on files and their contents, 
  to prevent commands to be executed unnecessarily`,
  )
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
  .arguments('<command...>')
  .action(cacheSh)
  .addHelpText(
    'after',
    `
Examples:
  $ cache-sh -i "{src/**/*,dist/**/*}" -- tsc
  $ cache-sh -i hi.log -- "sleep 2 && echo \"hi\" > hi.log"
  $ cache-sh -i "{./prisma/schema.prisma,node_modules/**/.prisma/client/**/*.*}" -- pnpm prisma generate  `,
  );

/**
 * cache-sh is a command line tool for caching shell commands
 *
 * Usage: cache-sh [options] [command]
 *
 * Options:
 * -i, --input    input to calculate the hash for the cache
 * -C, --config   set the config path (default: "cwd/.cache-sh")
 * -f, --force    ignore the cache the command
 * -c, --clear    clear the cache
 * -d, --cwd      set the current working directory
 * -v, --version  output the version number
 * -h, --help     display help for command
 *
 * Command: the command to execute and cache
 */
export const program = programCmd;
