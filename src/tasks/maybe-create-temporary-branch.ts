import { createGit } from "../create-git";
import * as core from "@actions/core";

export async function maybeCreateTemporaryBranch(): Promise<void> {
  const git = createGit();

  return isDetached()
    .then(() => {
      return git.revparse(["--short", "HEAD"]);
    })
    .then((currentHash) => {
      return `ci-tag-${currentHash}`;
    })
    .then(async (branchName) => {
      await git.checkoutLocalBranch(branchName);
      return branchName;
    })
    .then((branchName) => {
      core.info(`Branch ${branchName} created successfully.`);
      return branchName;
    })
    .then(async (branchName) => {
      await git.push(["-u", "origin", branchName]);
    })
    .catch((e) => {
      core.info(`Skipping temporary branch creation. Reason: ${e.message}.`);
    });
}

async function isDetached(): Promise<void> {
  return new Promise((resolve, reject) => {
    createGit()
      .revparse(["--abbrev-ref", "HEAD"])
      .then((branchName) => (branchName === "HEAD" ? resolve() : reject()));
  });
}
