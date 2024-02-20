import { ExecOptions, exec } from 'child_process';
import _debug from 'debug';
import { promisify } from 'util';

const debug = _debug('cache-sh:getGitHash');
const execAsync = promisify(exec);

/**
 * use `git` to get the hash of the files
 * command used: cat ./pnpm-lock.yaml | git hash-object --stdin
 */
export async function getGitHashForFiles(
  filePaths: string | string[],
  execOptions?: ExecOptions,
) {
  debug('getting hash for files', filePaths);
  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths];
  }
  if (filePaths.length === 0) {
    return '';
  }
  const allPathsSorted = filePaths.sort();
  const cmd = `{ echo "${allPathsSorted.join('')}" & cat ${allPathsSorted
    .map((path) => `"${path}"`)
    .join(' ')}; } | git hash-object --stdin`;
  debug(`calculating hash using command \n  \`${cmd}\``);

  const hash = await execAsync(cmd, {
    ...execOptions,
  });
  debug('hash.stdout', hash.stdout.trim());
  debug('hash.stderr', hash.stderr.trim());
  return hash.stdout.trim();
}
