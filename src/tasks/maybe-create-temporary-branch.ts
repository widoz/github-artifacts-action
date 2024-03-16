import { createGit } from "../create-git";
import * as core from "@actions/core";

export async function maybeCreateTemporaryBranch(): Promise<void> {
  const git = createGit();
  const _isDetached = await isDetached();

  if (!_isDetached) {
    return;
  }

  const currentHash = await git.revparse(["--short", "HEAD"]);
  const temporaryBranchName = `ci-tag-${currentHash}`;
  await git.checkoutLocalBranch(temporaryBranchName);

  core.info(`Temporary branch ${temporaryBranchName} created successfully.`);

  await git.push(["-u", "origin", temporaryBranchName]);
}

async function isDetached(): Promise<boolean> {
  const branchName = await createGit().revparse(["--abbrev-ref", "HEAD"]);
  return branchName === "HEAD";
}
