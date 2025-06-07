import type { SimpleGit } from 'simple-git';
import type { Tags } from '@model/tags';
import type { getInput } from '@actions/core';

import { it, jest, describe, expect } from '@jest/globals';
import { exec } from '@actions/exec';
import { fromPartial } from '@total-typescript/shoehorn';
import { Configuration } from '@/configuration';
import { Artifacts } from '@model/artifacts';

jest.mock('@actions/exec', () => ({
  __esModule: true,
  exec: jest.fn(),
}));

jest.mock('@model/tags', () => ({
  __esModule: true,
  Tags: {
    collect: jest.fn(),
    move: jest.fn(),
  },
}));

describe('Artifacts', () => {
  it('Compile the assets and Deploy when finished', async () => {
    const git = fromPartial<SimpleGit>({
      commit: jest.fn(() =>
        Promise.resolve({ summary: { changes: 0, insertions: 0, deletions: 0 } })
      ),
      push: jest.fn(() =>
        Promise.resolve({
          remoteMessages: {
            all: [''],
          },
        })
      ),
    });
    const tags = fromPartial<Tags>({ collect: jest.fn(), move: jest.fn() });
    const artifacts = new Artifacts(git, tags, configuration());

    jest.mocked(exec).mockImplementation(async () => Promise.resolve(0));

    await artifacts.update();

    expect(jest.mocked(exec)).toHaveBeenNthCalledWith(1, 'yarn build');
    expect(jest.mocked(exec)).toHaveBeenNthCalledWith(2, 'git add -f ./build/*');
  });

  it('Throw an error when failing to compile', async () => {
    const tags = fromPartial<Tags>({});
    const git = fromPartial<SimpleGit>({});
    const artifacts = new Artifacts(git, tags, configuration());

    jest.mocked(exec).mockImplementation(async () => Promise.resolve(1));

    await expect(artifacts.update()).rejects.toThrow(
      'Failed creating artifacts: Failing to compile artifacts. Process exited with non-zero code.'
    );
  });

  it('Throw an error when artifacts commit fails', async () => {
    const git = fromPartial<SimpleGit>({
      commit: jest.fn(() => Promise.reject(new Error('Failed to commit'))),
    });
    const tags = fromPartial<Tags>({ collect: jest.fn() });
    const artifacts = new Artifacts(git, tags, configuration());

    jest.mocked(exec).mockImplementation(async () => Promise.resolve(0));

    await expect(artifacts.update()).rejects.toThrow('Failed creating artifacts: Failed to commit');
  });

  it('Throw an error when artifacts push fails', async () => {
    const git = fromPartial<SimpleGit>({
      commit: jest.fn(() =>
        Promise.resolve({ summary: { changes: 0, insertions: 0, deletions: 0 } })
      ),
      push: jest.fn(() => Promise.reject(new Error('Failed to push'))),
    });
    const tags = fromPartial<Tags>({ collect: jest.fn() });
    const artifacts = new Artifacts(git, tags, configuration());

    jest.mocked(exec).mockImplementation(async () => Promise.resolve(0));

    await expect(artifacts.update()).rejects.toThrow('Failed creating artifacts: Failed to push');
  });

  it('Throw an error when failing to git-add', async () => {
    const git = fromPartial<SimpleGit>({});
    const tags = fromPartial<Tags>({ collect: jest.fn() });
    const artifacts = new Artifacts(git, tags, configuration());

    jest.mocked(exec).mockImplementation(async (command) => (command === 'yarn build' ? 0 : 1));

    await expect(artifacts.update()).rejects.toThrow(
      'Failed creating artifacts: Failing to git-add the artifacts build. Process exited with non-zero code.'
    );
  });

  it('Throw an error when collecting tags fails', () => {
    const git = fromPartial<SimpleGit>({});
    const tags = fromPartial<Tags>({
      collect: jest.fn(() => Promise.reject(new Error('Failed to collect tags'))),
    });
    const artifacts = new Artifacts(git, tags, configuration());

    jest.mocked(exec).mockImplementation(async () => Promise.resolve(0));

    expect(artifacts.update()).rejects.toThrow('Failed creating artifacts: Failed to collect tags');
  });

  it('Collect tags before moving them', async () => {
    const git = fromPartial<SimpleGit>({
      commit: jest.fn(() =>
        Promise.resolve({ summary: { changes: 0, insertions: 0, deletions: 0 } })
      ),
      push: jest.fn(() =>
        Promise.resolve({
          remoteMessages: {
            all: [''],
          },
        })
      ),
    });

    const collect = jest.fn();
    const move = jest.fn();
    const tags = fromPartial<Tags>({ collect, move });

    const artifacts = new Artifacts(git, tags, configuration());

    jest.mocked(exec).mockImplementation(async () => Promise.resolve(0));

    await artifacts.update();

    expect(collect.mock.invocationCallOrder[0]).toBeLessThan(move.mock.invocationCallOrder[0] ?? 0);
  });

  it('Do not perform any tasks associated to tags when the action is not running for tags', async () => {
    const git = fromPartial<SimpleGit>({
      commit: jest.fn(() =>
        Promise.resolve({ summary: { changes: 0, insertions: 0, deletions: 0 } })
      ),
      push: jest.fn(() =>
        Promise.resolve({
          remoteMessages: {
            all: [''],
          },
        })
      ),
    });

    const collect = jest.fn();
    const move = jest.fn();
    const tags = fromPartial<Tags>({ collect, move });

    const _configuration = configuration({
      GITHUB_REF: 'refs/heads/main',
    });
    const artifacts = new Artifacts(git, tags, _configuration);

    jest.mocked(exec).mockImplementation(async () => Promise.resolve(0));

    await artifacts.update();

    expect(collect).not.toHaveBeenCalled();
    expect(move).not.toHaveBeenCalled();
  });
});

function configuration(env?: Readonly<NodeJS.ProcessEnv>): Configuration {
  let _env = env;

  if (!_env) {
    _env = {
      GITHUB_REF: 'refs/tags/v1.0.0',
    };
  }

  return new Configuration(stubGetInput(), _env);
}

function stubGetInput(): typeof getInput {
  return jest.fn((name: string): string => {
    return name === 'command' ? 'yarn build' : './build';
  });
}
