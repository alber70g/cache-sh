import { describe, expect, it } from 'vitest';
import { getGitHashForFiles } from '../getGitHashForFiles';

describe('getGitHashForFiles', () => {
  it('should get the hash for files', async () => {
    const filePaths = ['one.log'];
    const hash = await getGitHashForFiles(filePaths, { cwd: __dirname });
    expect(hash).toBe('0a518c6db3ffd170f55a010d886e628d589d3524');
  });

  it('creates a hash different from previous hash when modifying the filename', async () => {
    const filePaths = ['one.log'];
    const hash = await getGitHashForFiles(filePaths, { cwd: __dirname });
    expect(hash).toBe('0a518c6db3ffd170f55a010d886e628d589d3524');

    const filePaths2 = ['one.log', 'two.log'];
    const hash2 = await getGitHashForFiles(filePaths2, { cwd: __dirname });
    expect(hash2).not.toBe(hash);
  });
});
