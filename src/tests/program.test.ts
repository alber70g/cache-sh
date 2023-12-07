import { exec } from 'child_process';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { beforeEach, describe, expect, it } from 'vitest';

function createFileOne(workingDir) {
  return exec(
    'node' +
      [
        './lib/index.js',
        '-i file.log',
        `-d ${workingDir}`,
        "echo 'test1' > src/tests/file.log",
      ].join(' '),
  );
}

function createFileTwo(workingDir) {
  return exec(
    'node' +
      [
        './lib/index.js',
        '-i file-two.log',
        `-d ${workingDir}`,
        "echo 'test1' > src/tests/file-two.log",
      ].join(' '),
  );
}

describe('cache-sh', () => {
  const workingDir = resolve(__dirname, '../../src/tests/');

  beforeEach(() => {
    existsSync(`${__dirname}/.cache-sh`) &&
      unlinkSync(`${__dirname}/.cache-sh`);
    existsSync(`${__dirname}/file.log`) && unlinkSync(`${__dirname}/file.log`);
  });

  // afterAll(() => {
  //   existsSync(`${__dirname}/.cache-sh`) &&
  //     unlinkSync(`${__dirname}/.cache-sh`);
  //   existsSync(`${__dirname}/file.log`) && unlinkSync(`${__dirname}/file.log`);
  //   existsSync(`${__dirname}/file-two.log`) &&
  //     unlinkSync(`${__dirname}/file-two.log`);
  // });

  it('creates a .cache-sh file', () => {
    const first = createFileOne(workingDir);

    expect(existsSync(`${__dirname}/.cache-sh`)).toBe(true);
    expect(first.stdout.toString()).toBe('');
    expect(readFileSync(`${__dirname}/.cache-sh`, 'utf-8')).toMatchSnapshot();
  });

  it('does not recreate when hitting twice', () => {
    const first = createFileOne(workingDir);

    expect(existsSync(`${__dirname}/.cache-sh`)).toBe(true);
    expect(first.stdout.toString()).toBe('');
    expect(readFileSync(`${__dirname}/.cache-sh`, 'utf-8')).toMatchSnapshot();

    const second = createFileOne(workingDir);

    expect(existsSync(`${__dirname}/.cache-sh`)).toBe(true);
    expect(second.stdout.toString()).toContain('skipping...');
    expect(readFileSync(`${__dirname}/.cache-sh`, 'utf-8')).toMatchSnapshot();
  });

  it('creates a second entry in the .cache-sh file', () => {
    const first = createFileOne(workingDir);
    const second = createFileTwo(workingDir);
    expect(existsSync(`${__dirname}/.cache-sh`)).toBe(true);
    expect(first.stdout.toString()).toBe('');
    expect(readFileSync(`${__dirname}/.cache-sh`, 'utf-8')).toMatchSnapshot();
    expect(second.stdout.toString()).toBe('');
  });
});
