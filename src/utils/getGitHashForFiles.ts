import { exec } from 'child_process';
import _debug from 'debug';
import { promisify } from 'util';

const debug = _debug('cache-sh:getGitHash');
const execAsync = promisify(exec);

/**
 * use `git` to get the hash of the files
 * command used: cat ./pnpm-lock.yaml | git hash-object --stdin
 */
export async function getGitHashForFiles(filePaths: string | string[]) {
  debug('getting hash for files', filePaths);
  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths];
  }
  if(filePaths.length === 0) {
    return '';
  }
  return (
    await execAsync(
      `cat ${filePaths.sort().join(' ')} | git hash-object --stdin`,
    )
  ).stdout.trim();
}
