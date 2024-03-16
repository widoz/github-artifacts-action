import { createGit } from "../create-git";
import * as core from "@actions/core";

export async function maybeRemoveTemporaryBranch(): Promise<void> {
  const git = createGit();

  return isTemporaryBranch()
    .then(async (branchName) => {
      await git.checkout("--detach");
      return branchName;
    })
    .then(async (branchName) => {
      await git.deleteLocalBranch(branchName);
      return branchName;
    })
    .then(async (branchName) => {
      await git.push(["--delete", "origin", branchName]);
      return branchName;
    })
    .then((branchName) => {
      core.info(`Temporary branch ${branchName} removed successfully.`);
    })
    .catch((e) => {
      core.info(`Skipping temporary branch removal. Reason: ${e.message}.`);
    });
}

async function isTemporaryBranch(): Promise<string> {
  return new Promise((resolve, reject) => {
    createGit()
      .revparse(["--abbrev-ref", "HEAD"])
      .then((branchName) =>
        branchName.startsWith("ci-tag-") ? resolve(branchName) : reject(),
      );
  });
}
