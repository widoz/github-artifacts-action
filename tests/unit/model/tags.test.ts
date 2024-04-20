import type { SimpleGit } from 'simple-git';

import { describe, it, expect, jest } from '@jest/globals';
import { fromPartial } from '@total-typescript/shoehorn';
import { Tags } from '@model/tags';

describe('Tags', () => {
  it('Can move the collected tags', async () => {
    const git = fromPartial<SimpleGit>({
      tags: jest.fn(() => Promise.resolve({ all: ['tag1', 'tag2'] })),
      tag: jest.fn(),
      addTag: jest.fn(),
      push: jest.fn(() => Promise.resolve({ remoteMessages: { all: [''] } })),
      pushTags: jest.fn(() => Promise.resolve({ remoteMessages: { all: [''] } })),
    });

    const tags = new Tags(git);

    await tags.collect();
    await tags.move();

    expect(git.tag).toHaveBeenCalledWith(['-d', 'tag1', 'tag2']);
    expect(git.push).toHaveBeenCalledWith(['--delete', 'origin', 'tag1', 'tag2']);
    expect(git.addTag).toHaveBeenCalledWith('tag1');
    expect(git.addTag).toHaveBeenCalledWith('tag2');
    expect(git.pushTags).toHaveBeenCalled();
  });

  it('Do not move tags if there are no collected tags', async () => {
    const git = fromPartial<SimpleGit>({
      tags: jest.fn(() => Promise.resolve({ all: [] })),
      tag: jest.fn(),
      addTag: jest.fn(),
      push: jest.fn(),
      pushTags: jest.fn(),
    });

    const tags = new Tags(git);

    await tags.collect();
    await tags.move();

    expect(git.tag).not.toHaveBeenCalled();
    expect(git.push).not.toHaveBeenCalled();
    expect(git.addTag).not.toHaveBeenCalled();
    expect(git.pushTags).not.toHaveBeenCalled();
  });
});
