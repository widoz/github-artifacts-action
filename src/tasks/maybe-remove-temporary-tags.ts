import { createGit } from "../create-git";
import * as core from "@actions/core";

export async function maybeRemoveTemporaryBranch(): Promise<void> {
  const git = createGit();

  return (
    isTemporaryBranch()
      .then((branchName) => {
        git.checkout("--detach");
        return branchName;
      })
      .then((branchName) => {
        git.deleteLocalBranch(branchName);
        return branchName;
      })
      // .then((branchName) => {
      //   git.push(["--delete", "origin", branchName]);
      //   return branchName;
      // })
      .then((branchName) => {
        core.info(`Temporary branch ${branchName} removed successfully.`);
      })
  );
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
