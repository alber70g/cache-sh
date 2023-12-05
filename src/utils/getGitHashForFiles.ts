import { execSync } from 'child_process';

/**
 * use `git` to get the hash of the files
 * command used: cat ./pnpm-lock.yaml | git hash-object --stdin
 */
export function getGitHashForFiles(...filePaths: string[]) {
  return execSync(`cat ${filePaths.sort().join(' ')} | git hash-object --stdin`)
    .toString()
    .trim();
}
