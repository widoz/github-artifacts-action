import * as core from "@actions/core";
import { createGit } from "../create-git";

type Tags = Set<string>;

export async function maybeMoveTags(): Promise<Tags | void> {
  core.startGroup("🗄️ Start handling tags.");
  return retrieveTags()
    .then(assertTags)
    .then(toggleTags)
    .catch(handleError)
    .finally(() => core.endGroup());
}

async function retrieveTags(): Promise<Tags> {
  const git = createGit();
  const tags = (await git.tags(["--contains"])).all;

  core.info(`Retrieved tags: ${renderTags(tags)}.`);

  return new Set(tags);
}

function assertTags(tags: Tags): Tags {
  if (tags.size === 0) {
    throw new Error("No tags found. Skipping tags handling.", {
      cause: "no-tags",
    });
  }
  return tags;
}

async function toggleTags(tags: Tags): Promise<Tags> {
  return removeTags(tags).then(createTags);
}

async function removeTags(tags: Tags): Promise<Tags> {
  const git = createGit();

  core.info(`Removing Existing Tags ${renderTags(tags)}.`);

  await git.tag(["-d", ...tags]);

  return tags;
}

async function createTags(tags: Tags): Promise<Tags> {
  const git = createGit();

  core.info(`Creating Tags: ${renderTags(tags)}.`);

  await Promise.all([...tags].map(async (tag) => git.addTag(tag)));
  await git.pushTags();

  return tags;
}

function handleError(error: Error) {
  if (error.cause === "no-tags") {
    core.info("No tags found. Skipping tags handling.");
    return;
  }

  // Re-throw for external catching.
  throw error;
}

function renderTags(tags: Tags | Array<string>): string {
  return [...tags].join(", ");
}
