import type { SimpleGit } from 'simple-git';
import gitFactory from 'simple-git';

type PossibleValue = boolean | string | number | Array<unknown> | undefined | null;

let git: SimpleGit | null = null;

export async function createGit(): Promise<SimpleGit> {
  if (git) {
    return git;
  }

  const workingDirectory = `${process.env['GITHUB_WORKSPACE']}`;
  const userName = `${process.env['GIT_USER']}`;
  const userEmail = `${process.env['GIT_EMAIL']}`;

  try {
    assertNotFalsy(workingDirectory, 'Working directory is empty.');
    assertNotFalsy(userName, 'Git user name is empty.');
    assertNotFalsy(userEmail, 'Git user email is empty.');

    git = gitFactory({ baseDir: workingDirectory });

    await git
      .addConfig('user.name', userName)
      .addConfig('user.email', userEmail)
      .addConfig('advice.addIgnoredFile', 'false');
  } catch (error: unknown) {
    const message = String(error instanceof Error ? error.message : error);
    console.warn(`Warning: ${message}`);
  }

  assertGit(git);

  return git;
}

function assertGit(git: unknown): asserts git is SimpleGit {
  if (git === null) {
    throw new Error('Git is not initialized.');
  }
}

function assertNotFalsy<Expected extends PossibleValue>(
  value: Readonly<PossibleValue>,
  message: string
): asserts value is Exclude<Expected, undefined | null> {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if ((Array.isArray(value) && value.length <= 0) || !value) {
    throw new Error(message || 'Unknown error');
  }
}
