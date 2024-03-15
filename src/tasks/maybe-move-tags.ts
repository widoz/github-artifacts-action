import * as core from "@actions/core";
import { createGit } from "../create-git";

type Tags = Set<string>;

export async function maybeMoveTags(): Promise<void> {
  return Promise.resolve(new Set<string>())
    .then((tags) => {
      core.startGroup("🗄️ Start handling tags.");
      return tags;
    })
    .then(retrieveTags)
    .then(assertTags)
    .then(toggleTags)
    .then(() => {})
    .catch((error: Error) => {
      if (error.cause === "no-tags") {
        core.info(" No tags found. Skipping tags handling.");
        return;
      }

      // Re-throw for external catching.
      throw error;
    })
    .finally(() => core.endGroup());
}

async function retrieveTags(tags: Tags): Promise<Tags> {
  const git = createGit();
  const _tags = await git.tags(["--contains"]);

  return Promise.resolve(_tags)
    .then((tags) => {
      console.log(`Retrieved tags: ${tags.all}`);
      return tags.all;
    })
    .then((rawTags) => {
      core.info(`Retrieved tags: ${rawTags.join("\n")}`);
      rawTags.forEach((tag) => tags.add(tag));
      return tags;
    });
}

async function assertTags(tags: Tags): Promise<Tags> {
  if (tags.size === 0) {
    throw new Error("No tags found. Skipping tags handling.", {
      cause: "no-tags",
    });
  }
  return Promise.resolve(tags);
}

async function toggleTags(tags: Tags): Promise<Tags> {
  return removeTags(tags).then(createTags);
}

async function removeTags(tags: Tags): Promise<Tags> {
  const git = createGit();

  core.info("Removing Existing Tags.");

  return git.tag(["-d", ...tags]).then(() => {
    core.info("Tags removed successfully.");
    return tags;
  });
}

async function createTags(tags: Tags): Promise<Tags> {
  const git = createGit();

  core.info(`Creating Tags: ${tags}.`);

  return Promise.all([...tags].map(async (tag) => git.addTag(tag)))
    .then(() => git.pushTags())
    .then(() => {
      core.info("Tags created successfully.");
      return tags;
    });
}
