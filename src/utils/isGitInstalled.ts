import { execSync } from 'child_process';

export function isGitInstalledOrThrow() {
  try {
    execSync('git --version');
    return true;
  } catch (error) {
    throw new error(
      'ERROR: `git` is not installed. This is used to calculate the hash of the files.',
    );
  }
}
