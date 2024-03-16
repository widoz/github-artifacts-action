import * as exec from "@actions/exec";
import * as core from "@actions/core";

export async function createArtifacts(): Promise<void> {
  core.startGroup("📦 Creating artifacts");

  try {
    await exec.exec("yarn build");
  } catch (error) {
    core.warning(`Failed to create artifacts: ${error}`);
    core.endGroup();
    throw error;
  }
}
