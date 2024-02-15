import { exec } from 'child_process';

export const createRunCommand = (command: string, cwd: string) => async () => {
  return new Promise((resolve, reject) => {
    try {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          process.stdout.write(stdout);
          process.stderr.write(stderr);
          resolve(0);
        }
      });
    } catch (e) {
      reject('unexpected error occurred' + e);
    }
  });
};
