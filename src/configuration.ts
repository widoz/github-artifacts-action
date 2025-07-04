import type { getInput } from '@actions/core';

export class Configuration {
  private static readonly COMMAND = 'yarn build';
  private static readonly TARGET_DIR = './build';

  constructor(
    private readonly read: typeof getInput,
    private readonly env: Readonly<NodeJS.ProcessEnv>
  ) {}

  public get command(): string {
    return this.read('command') || Configuration.COMMAND;
  }

  public get targetDir(): string {
    return this.read('target-dir') || Configuration.TARGET_DIR;
  }

  public get isTag(): boolean {
    return (this.env['GITHUB_REF'] ?? '').startsWith('refs/tags/');
  }

  public get canPush(): boolean {
    return this.read('can-push') === 'true';
  }
}
