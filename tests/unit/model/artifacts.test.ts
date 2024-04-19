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

    jest.mocked(exec).mockImplementation(async () => Promise.resolve(0));

    const artifacts = new Artifacts(git, tags, configuration());

    await artifacts.update();

    expect(jest.mocked(exec)).toHaveBeenNthCalledWith(1, 'yarn build');
    expect(jest.mocked(exec)).toHaveBeenNthCalledWith(2, 'git add -f ./build/*');
  });

  it('Throw an error when failing to compile', async () => {
    jest.mocked(exec).mockImplementation(async () => Promise.resolve(1));
    const artifacts = new Artifacts(
      fromPartial<SimpleGit>({}),
      fromPartial<Tags>({}),
      configuration()
    );
    await expect(artifacts.update()).rejects.toThrow(
      'Failed creating artifacts: Failing to compile artifacts. Process exited with non-zero code.'
    );
  });

  it('Throw an error when failing to git-add', async () => {
    jest.mocked(exec).mockImplementation(async (command) => (command === 'yarn build' ? 0 : 1));
    const artifacts = new Artifacts(
      fromPartial<SimpleGit>({}),
      fromPartial<Tags>({}),
      configuration()
    );
    await expect(artifacts.update()).rejects.toThrow(
      'Failed creating artifacts: Failing to git-add the artifacts build. Process exited with non-zero code.'
    );
  });
});

function configuration(): Configuration {
  return new Configuration(stubGetInput());
}

function stubGetInput(): typeof getInput {
  return jest.fn((name: string): string => {
    return name === 'command' ? 'yarn build' : './build';
  });
}
