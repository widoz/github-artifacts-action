import * as core from "@actions/core";
// import { createArtifacts } from "./tasks/create-artifacts";
import { maybeMoveTags } from "./tasks/maybe-move-tags";
// import { pushAssets } from "./tasks/push-assets";
// import { maybeCreateTemporaryBranch } from "./tasks/maybe-create-temporary-branch";
// import { maybeRemoveTemporaryBranch } from "./tasks/maybe-remove-temporary-tags";

async function main(): Promise<void> {
  Promise.resolve()
    .then(maybeMoveTags)

    // .then(maybeCreateTemporaryBranch)
    // .then(createArtifacts)
    // .then(pushAssets)
    // .then(maybeRemoveTemporaryBranch)

    .catch((error) =>
      core.setFailed(`Failed to create and push artifacts: ${error}`),
    );
}

export default main;
