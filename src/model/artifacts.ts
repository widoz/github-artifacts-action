import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { SimpleGit } from "simple-git";
import { Tags } from "./tags";

export class Artifacts {
  private static COMMAND = "yarn build";
  private static TARGET_DIR = "./build";

  private git: SimpleGit;
  private tags: Tags;

  constructor(git: SimpleGit, tags: Tags) {
    this.git = git;
    this.tags = tags;
  }

  public async update(): Promise<void> {
    core.startGroup("📦 Creating artifacts");

    try {
      await this.compile();
      await this.deploy();
    } catch (error) {
      core.endGroup();
      throw new Error(`Failed creating artifacts: ${error}`);
    }

    core.endGroup();
  }

  private async compile(): Promise<void> {
    const result = await exec.exec(Artifacts.COMMAND);
    if (result !== 0) {
      throw new Error(
        "Failing to compile artifacts. Process exited with non-zero code.",
      );
    }
  }

  private async deploy(): Promise<void> {
    await this.add();

    await this.tags.collect();
    await this.commit();
    await this.push();
    await this.tags.move();
  }

  private async add(): Promise<void> {
    const result = await exec.exec(`git add -f ${Artifacts.TARGET_DIR}/*`);
    if (result !== 0) {
      throw new Error(
        "Failing to git-add the artifacts build. Process exited with non-zero code.",
      );
    }
  }

  private async commit(): Promise<void> {
    const commitResult = await this.git.commit("🚀 Build Artifacts");
    core.info(`Committed changes: ${commitResult.summary.changes}`);
    core.info(`Committed insertions: ${commitResult.summary.insertions}`);
    core.info(`Committed deletions: ${commitResult.summary.deletions}`);
  }

  private async push(): Promise<void> {
    const pushingResult = await this.git.push();
    const messages = pushingResult?.remoteMessages.all.join("\n");
    messages && core.info(`Pushed artifacts with messages: ${messages}`);
  }
}
