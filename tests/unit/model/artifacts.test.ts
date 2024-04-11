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

    jest.mocked(exec).mockImplementationOnce(async (command) => {
      expect(command).toEqual('yarn build');
      return Promise.resolve(0);
    });
    jest.mocked(exec).mockImplementationOnce(async (command) => {
      expect(command).toEqual('git add -f ./build/*');
      return Promise.resolve(0);
    });

    const artifacts = new Artifacts(git, tags, configuration());

    await artifacts.update();
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
