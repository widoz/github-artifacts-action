import type { PushResult, SimpleGit } from 'simple-git';
import { createGit } from '../create-git';
import * as core from '@actions/core';

export class Tags {
  private tags: Array<string> = [];
  private readonly git: SimpleGit = createGit();

  public async collect(): Promise<void> {
    this.tags = (await this.git.tags(['--contains'])).all;
    core.info(`Collecting tags: ${this.toString()}`);
  }

  public async move(): Promise<void> {
    core.info(`Moving tags: ${this.toString()}`);
    await this.remove();
    await this.create();
  }

  private async remove(): Promise<void> {
    await this.git.tag(['-d', ...this.tags]);
    const pushResult = await this.git.push(['--delete', 'origin', ...this.tags]);
    this.pushInfo(pushResult, 'Removed tags with messages');
  }

  private async create(): Promise<void> {
    await Promise.all(this.tags.map(async (tag) => this.git.addTag(tag)));
    const pushResult = await this.git.pushTags();
    this.pushInfo(pushResult, 'Pushed tags with messages');
  }

  private toString(): string {
    if (!this.tags.length) {
      return '';
    }

    return [...this.tags].join(', ');
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  private pushInfo(result: Readonly<PushResult>, message: string): void {
    const messages = result.remoteMessages.all.join('\n');
    messages && core.info(`${message}: ${messages}`);
  }
}
