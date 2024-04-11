import type { SimpleGit } from 'simple-git';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import type { Tags } from './tags';
import type { Configuration } from '@/configuration';

export class Artifacts {
  constructor(
    private readonly git: Readonly<SimpleGit>,
    private readonly tags: Readonly<Tags>,
    private readonly configuration: Readonly<Configuration>
  ) {}

  public async update(): Promise<void> {
    core.startGroup('📦 Creating artifacts');

    try {
      await this.compile();
      await this.deploy();
    } catch (error: Error | unknown) {
      core.endGroup();
      const message = String(error instanceof Error ? error.message : error);
      throw new Error(`Failed creating artifacts: ${message}`);
    }

    core.endGroup();
  }

  private async compile(): Promise<void> {
    const result = await exec.exec(this.configuration.command);
    if (result !== 0) {
      throw new Error('Failing to compile artifacts. Process exited with non-zero code.');
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
    const result = await exec.exec(`git add -f ${this.configuration.targetDir}/*`);
    if (result !== 0) {
      throw new Error('Failing to git-add the artifacts build. Process exited with non-zero code.');
    }
  }

  private async commit(): Promise<void> {
    const commitResult = await this.git.commit('🚀 Build Artifacts');
    core.info(`Committed changes: ${commitResult.summary.changes}`);
    core.info(`Committed insertions: ${commitResult.summary.insertions}`);
    core.info(`Committed deletions: ${commitResult.summary.deletions}`);
  }

  private async push(): Promise<void> {
    const pushingResult = await this.git.push();
    const messages = pushingResult.remoteMessages.all.join('\n');
    messages && core.info(`Pushed artifacts with messages: ${messages}`);
  }
}
