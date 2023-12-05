#!/usr/bin/env node
import { program } from 'commander';
import { cacheSh } from './cache-sh';
import { getVersionFromPackageJson } from './utils/getVersionFromPackageJson';

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
 * -V, --version  output the version number
 * -h, --help     display help for command
 *
 * Command: the command to execute and cache
 */
program
  .name('cacheSh')
  .description('cacheSh is a command line tool for caching shell commands')
  .version(getVersionFromPackageJson());

program
  .requiredOption(
    '-i, --input <input>',
    `input to calculate the hash for the cache using \`glob\`. 
Use \`cli-glob\` npm package to test your globs`
  )
  .option(
    '-C, --config <path>',
    'set the config path (default: "$PWD/.cacheSh")'
  )
  .option('-f, --force', 'ignore the cache the command')
  .option('-c, --clear', 'clear the cache')
  .arguments('<command>')
  .action(cacheSh);

program.parse();
