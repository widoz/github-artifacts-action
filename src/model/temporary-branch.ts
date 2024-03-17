import * as core from "@actions/core";
import { PushResult, SimpleGit } from "simple-git";

export class TemporaryBranch {
  private git: SimpleGit;

  constructor(git: SimpleGit) {
    this.git = git;
  }

  async create(): Promise<void> {
    const _isDetached = await this.isDetached();

    if (!_isDetached) {
      return;
    }

    const currentHash = await this.git.revparse(["--short", "HEAD"]);
    const temporaryBranchName = `ci-tag-${currentHash}`;
    await this.git.checkoutLocalBranch(temporaryBranchName);

    const pushResult = await this.git.push([
      "-u",
      "origin",
      temporaryBranchName,
    ]);

    this.pushInfo(pushResult, "Created temporary branch with messages");
    core.info(`Temporary branch ${temporaryBranchName} created successfully.`);
  }

  async delete(): Promise<void> {
    const _temporaryBranch = await this.branchName();

    if (!_temporaryBranch) {
      return;
    }

    await this.git.checkout("--detach");

    const deleteResult = await this.git.deleteLocalBranch(_temporaryBranch);
    core.info(
      deleteResult.success
        ? `Temporary branch ${_temporaryBranch} deleted successfully.`
        : `Failed to delete temporary branch ${_temporaryBranch}.`,
    );

    const pushResult = await this.git.push([
      "--delete",
      "origin",
      _temporaryBranch,
    ]);
    this.pushInfo(pushResult, "Removed temporary branch with messages");
    core.info(`Temporary branch ${_temporaryBranch} removed successfully.`);
  }

  private async isDetached(): Promise<boolean> {
    const branchName = await this.git.revparse(["--abbrev-ref", "HEAD"]);
    return branchName === "HEAD";
  }

  async branchName(): Promise<string> {
    const branchName = await this.git.revparse(["--abbrev-ref", "HEAD"]);
    return branchName.startsWith("ci-tag-") ? branchName : "";
  }

  private pushInfo(result: PushResult, message: string): void {
    const messages = result?.remoteMessages.all.join("\n");
    messages && core.info(`${message}: ${messages}`);
  }
}
