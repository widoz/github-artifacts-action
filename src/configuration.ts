import type { getInput } from '@actions/core';

export class Configuration {
  private static readonly COMMAND = 'yarn build';
  private static readonly TARGET_DIR = './build';

  constructor(private readonly read: typeof getInput) {}

  public get command(): string {
    return this.read('command') || Configuration.COMMAND;
  }

  public get targetDir(): string {
    return this.read('target-dir') || Configuration.TARGET_DIR;
  }
}
