import { createGit } from "../create-git";
import * as core from "@actions/core";

export async function maybeRemoveTemporaryBranch(): Promise<void> {
  const git = createGit();
  const _temporaryBranch = await temporaryBranch();

  if (!_temporaryBranch) {
    return;
  }

  await git.checkout("--detach");
  await git.deleteLocalBranch(_temporaryBranch);
  await git.push(["--delete", "origin", _temporaryBranch]);

  core.info(`Temporary branch ${_temporaryBranch} removed successfully.`);
}

async function temporaryBranch(): Promise<string> {
  const branchName = await createGit().revparse(["--abbrev-ref", "HEAD"]);
  return branchName.startsWith("ci-tag-") ? branchName : "";
}
