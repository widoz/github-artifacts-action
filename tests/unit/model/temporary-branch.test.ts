import type { SimpleGit } from 'simple-git';

import { describe, it, expect, jest } from '@jest/globals';
import { fromPartial } from '@total-typescript/shoehorn';
import { TemporaryBranch } from '@model/temporary-branch';

describe('Temporary Branch', () => {
  it('Should create a temporary branch', async () => {
    const git = fromPartial<SimpleGit>({
      revparse: jest.fn((args: ReadonlyArray<string>) => {
        if (args.includes('--abbrev-ref')) {
          return Promise.resolve('HEAD');
        }
        if (args.includes('--short')) {
          return Promise.resolve('1234567');
        }

        return Promise.reject(new Error('Invalid arguments'));
      }),
      checkoutLocalBranch: jest.fn(() => Promise.resolve(undefined)),
      push: jest.fn(() => ({ remoteMessages: { all: [] } })),
    });

    const temporaryBranch = new TemporaryBranch(git);
    await temporaryBranch.create();

    expect(git.revparse).toHaveBeenNthCalledWith(2, ['--short', 'HEAD']);
    expect(git.checkoutLocalBranch).toBeCalledWith('ci-tag-1234567');
    expect(git.push).toBeCalledWith(['-u', 'origin', 'ci-tag-1234567']);
  });

  it('Do not create a temporary branch if not detached', async () => {
    const git = fromPartial<SimpleGit>({
      revparse: jest.fn(() => Promise.resolve('main')),
      checkoutLocalBranch: jest.fn(),
      push: jest.fn(),
    });

    const temporaryBranch = new TemporaryBranch(git);
    await temporaryBranch.create();

    expect(git.checkoutLocalBranch).not.toHaveBeenCalled();
    expect(git.push).not.toHaveBeenCalled();
  });

  it('Should delete a temporary branch', async () => {
    const git = fromPartial<SimpleGit>({
      revparse: jest.fn(() => Promise.resolve('ci-tag-1234567')),
      checkout: jest.fn(() => Promise.resolve(undefined)),
      deleteLocalBranch: jest.fn(() => ({ success: true })),
      push: jest.fn(() => ({ remoteMessages: { all: [] } })),
    });

    const temporaryBranch = new TemporaryBranch(git);
    await temporaryBranch.delete();

    expect(git.checkout).toHaveBeenCalledWith('--detach');
    expect(git.deleteLocalBranch).toHaveBeenCalledWith('ci-tag-1234567');
    expect(git.push).toHaveBeenCalledWith(['--delete', 'origin', 'ci-tag-1234567']);
  });

  it('Do not delete a temporary branch if not exists', async () => {
    const git = fromPartial<SimpleGit>({
      revparse: jest.fn(() => Promise.resolve('main')),
      checkout: jest.fn(),
      deleteLocalBranch: jest.fn(),
      push: jest.fn(),
    });

    const temporaryBranch = new TemporaryBranch(git);
    await temporaryBranch.delete();

    expect(git.checkout).not.toHaveBeenCalled();
    expect(git.deleteLocalBranch).not.toHaveBeenCalled();
    expect(git.push).not.toHaveBeenCalled();
  });
});
