import * as core from "@actions/core";

import { createGit } from "../create-git";

export async function pushAssets(): Promise<void> {
  const git = createGit();

  core.startGroup("🚀 Pushing Artifacts");

  try {
    await git.add(["-f", "./build"]);
    const commitResult = await git.commit("🚀 Build Artifacts");
    const numberOfChanges = commitResult.summary.changes;

    core.info(`Committed changes: ${numberOfChanges}`);

    if (numberOfChanges <= 0) {
      core.info("No changes to commit");
    }

    const pushingResult = await git.push();

    const messages = pushingResult?.remoteMessages.all.join("\n");
    messages && core.info(`Pushed artifacts with result: ${messages}`);
  } catch (error) {
    core.warning(`Failed to push artifacts: ${error}`);
    core.endGroup();
    throw error;
  }
}
