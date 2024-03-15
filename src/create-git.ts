import gitFactory, { SimpleGit } from "simple-git";

type PossibleValue = boolean | string | number | unknown[] | undefined | null;

let git: SimpleGit | null = null;

export function createGit(): SimpleGit {
  if (git) {
    return git;
  }

  const workingDirectory = `${process.env["GITHUB_WORKSPACE"]}`;
  const userName = `${process.env["GIT_USER"]}`;
  const userEmail = `${process.env["GIT_EMAIL"]}`;

  try {
    assertNotFalsy(workingDirectory, "Working directory is empty.");
    assertNotFalsy(userName, "Git user name is empty.");
    assertNotFalsy(userEmail, "Git user email is empty.");

    git = gitFactory({ baseDir: workingDirectory });

    git
      ?.addConfig("user.name", userName)
      ?.addConfig("user.email", userEmail)
      ?.addConfig("advice.addIgnoredFile", "false");
  } catch (e: any) {
    console.warn(`Warning: ${e.message ?? e}`);
  }

  assertGit(git);

  return git;
}

function assertGit(git: unknown): asserts git is SimpleGit {
  if (!git) {
    throw new Error("Git is not initialized.");
  }
}

function assertNotFalsy<Expected extends PossibleValue>(
  value: PossibleValue,
  message: string,
): asserts value is Exclude<Expected, undefined | null> {
  if ((Array.isArray(value) && value.length <= 0) || !value) {
    throw new Error(message || "Unknown error");
  }
}
