import * as core from "@actions/core";
import { Artifacts } from "./model/artifacts";
import { Tags } from "./model/tags";
import { createGit } from "./create-git";
import { TemporaryBranch } from "./model/temporary-branch";

async function main(): Promise<void> {
  const git = createGit();
  const tags = new Tags();
  const artifacts = new Artifacts(git, tags);
  const temporaryBranch = new TemporaryBranch(git);

  Promise.resolve()
    .then(() => temporaryBranch.create())
    .then(() => artifacts.update())
    .then(() => temporaryBranch.delete())

    .catch((error) =>
      core.setFailed(`Failed to create and push artifacts: ${error}`),
    );
}

export default main;
