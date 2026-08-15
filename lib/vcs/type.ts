export interface VcsRepo {
  owner: string;
  repo: string;
  isPrivate: boolean;
  defaultBranch: string;
}

export interface VcsProvider {
  listAccessibleRepos(installationId: string): Promise<VcsRepo[]>;
  getTarballUrl(installationId: string, owner: string, repo: string, ref?: string): Promise<string>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}