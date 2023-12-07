import { spawn } from 'child_process';

export const createRunCommand = (command: string, cwd: string) => async () => {
  return new Promise((resolve, reject) => {
    try {
      const [cmd, ...cmdArgs] = command.split(' ');
      const child = spawn(cmd, cmdArgs, { cwd });

      child.stdout.on('data', (data: any) => {
        process.stdout.write(data);
      });
      child.stderr.on('data', (data: any) => {
        process.stderr.write(data);
      });
      child.on('error', (error: any) => {
        console.error(error);
      });
      child.on('exit', (code: any) => {
        resolve(code);
      });
    } catch (e) {
      reject('unexpected error occurred' + e);
    }
  });
};
