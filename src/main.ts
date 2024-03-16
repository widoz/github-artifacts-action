import * as core from "@actions/core";
import { maybeCreateTemporaryBranch } from "./tasks/maybe-create-temporary-branch";
import { maybeRemoveTemporaryBranch } from "./tasks/maybe-remove-temporary-tags";
import { Artifacts } from "./model/artifacts";
import { Tags } from "./model/tags";
import { createGit } from "./create-git";

async function main(): Promise<void> {
  const git = createGit();
  const tags = new Tags();
  const assets = new Artifacts(git, tags);

  Promise.resolve()
    .then(maybeCreateTemporaryBranch)
    .then(assets.update)
    .then(maybeRemoveTemporaryBranch)

    .catch((error) =>
      core.setFailed(`Failed to create and push artifacts: ${error}`),
    );
}

export default main;
