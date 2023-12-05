import { describe, it, expect } from 'vitest';
import { cacheSh } from '../cache-sh';

describe('cache-sh', () => {
  it('creates initial .cashsh file when command runs the first time', () => {

    cacheSh('echo "hello world" > ./test.file.log', {
      input: './test.file.log',
    });
  });
});
