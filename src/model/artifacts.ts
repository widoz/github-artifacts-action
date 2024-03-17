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
      await this.push();
    } catch (error) {
      core.warning(`Failed creating artifacts: ${error}`);
      core.endGroup();
      throw error;
    }
  }

  private async compile(): Promise<void> {
    const result = await exec.exec(Artifacts.COMMAND);
    if (result !== 0) {
      throw new Error(
        "Failed to compile artifacts. Process exited with non-zero code.",
      );
    }
  }

  private async push() {
    await this.tags.collect();

    await exec.exec(`git add -f ${Artifacts.TARGET_DIR}/*`);
    const commitResult = await this.git.commit("🚀 Build Artifacts");
    const pushingResult = await this.git.push();

    core.info(`Committed changes: ${commitResult.summary.changes}`);

    await this.tags.move();

    const messages = pushingResult?.remoteMessages.all.join("\n");
    messages && core.info(`Pushed artifacts with messages: ${messages}`);
  }
}
