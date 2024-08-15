import * as core from '@actions/core';
import { Artifacts } from '@model/artifacts';
import { Tags } from '@model/tags';
import { TemporaryBranch } from '@model/temporary-branch';
import { createGit } from './create-git';
import { Configuration } from './configuration';

async function main(): Promise<void> {
  const configuration = new Configuration(core.getInput.bind(core));

  const git = await createGit();
  const tags = new Tags(git);
  const artifacts = new Artifacts(git, tags, configuration);
  const temporaryBranch = new TemporaryBranch(git);

  Promise.resolve()
    .then(() => temporaryBranch.create())
    .then(() => artifacts.update())
    .then(() => temporaryBranch.delete())

    .catch((error) => {
      core.setFailed(`Failed to create and push artifacts: ${error}`);
    });
}

export default main;
