import { App } from '@octokit/app';
import crypto from 'crypto';
import type { VcsProvider } from './type';

const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    webhooks: { secret: process.env.GITHUB_WEBHOOK_SECRET! },
});

export const githubProvider: VcsProvider = {
    async listAccessibleRepos(installationId) {
        const octokit = await app.getInstallationOctokit(Number(installationId));
        const { data } = await octokit.request('GET /installation/repositories');
        return data.repositories.map((r) => ({
            owner: r.owner.login,
            repo: r.name,
            isPrivate: r.private,
            defaultBranch: r.default_branch,
        }));
    },
    // GitHub redirects tarball requests to a time-limited codeload.github.com URL
    // that needs no further auth — capture the Location header instead of following it,
    // so the worker (separate service) can fetch the bytes itself.
    async getTarballUrl(installationId, owner, repo, ref = 'HEAD') {
        const octokit = await app.getInstallationOctokit(Number(installationId));
        const response = await octokit.request('GET /repos/{owner}/{repo}/tarball/{ref}', {
            owner,
            repo,
            ref,
            request: { redirect: 'manual' },
        });
        const location = response.headers.location;
        if (!location) throw new Error(`No tarball redirect for ${owner}/${repo}`);
        return location;
    },

    // GitHub Apps use one app-wide webhook (configured on the app itself), not
    // per-repo registration — this just verifies the signature GitHub sends.
    verifyWebhookSignature(payload, signature) {
        const expected =
            'sha256=' +
            crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!).update(payload).digest('hex');
        return (
            expected.length === signature.length &&
            crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
        );
    },
}