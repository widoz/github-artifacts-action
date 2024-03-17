import { createGit } from "../create-git";
import { SimpleGit } from "simple-git";

export class Tags {
  private tags: Array<string> = [];
  private git: SimpleGit = createGit();

  public async collect(): Promise<void> {
    this.tags = (await this.git.tags(["--contains"])).all;
  }

  public async move(): Promise<void> {
    await this.remove();
    await this.create();
  }

  public toString(): string {
    if (!this.tags.length) {
      return "";
    }

    return [...this.tags].join(", ");
  }

  private async remove(): Promise<void> {
    await this.git.tag(["-d", ...this.tags]);
    await this.git.push(["--delete", "origin", ...this.tags]);
  }

  private async create(): Promise<void> {
    await Promise.all(this.tags.map(async (tag) => this.git.addTag(tag)));
    await this.git.pushTags();
  }
}
