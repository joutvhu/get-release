import * as core from '@actions/core';
import {context, getOctokit} from '@actions/github';
import {getInputs, ReleaseInputs, setOutputs} from './io-helper';

export function isSuccessStatusCode(statusCode?: number): boolean {
    if (!statusCode) return false;
    return statusCode >= 200 && statusCode < 300;
}

export function findLatestRelease(releases: any[]): any {
    let result: any, latest: number = 0;

    // Find the latest release by `published_at`
    releases.forEach(release => {
        const publishedDate: number = release.published_at ? Date.parse(release.published_at) : 0;
        if (result == null || latest < publishedDate) {
            result = release;
            latest = publishedDate;
        }
    });

    return result;
}

export function notFoundRelease(message: string, throwing: boolean) {
    if (throwing)
        throw new Error(message);
    else core.warning(message);
}

(async function run() {
    try {
        const inputs: ReleaseInputs = getInputs();
        const github = getOctokit(process.env.GITHUB_TOKEN as string);
        // Get owner and repo from context of payload that triggered the action
        const {owner, repo} = context.repo;

        if (!inputs.latest) {
            // Get a release from the tag name
            const releaseResponse = await github.repos
                .getReleaseByTag({owner, repo, tag: inputs.tag});

            if (isSuccessStatusCode(releaseResponse.status))
                setOutputs(releaseResponse.data, inputs.debug);
            else
                throw new Error(`Unexpected http ${releaseResponse.status} during get release`);
        } else {
            const listResponse = await github.repos.listReleases({owner, repo});

            if (isSuccessStatusCode(listResponse.status)) {
                const releaseList = listResponse.data
                    .filter(release => !release.draft &&
                        (!release.prerelease || inputs.prerelease) &&
                        (!inputs.pattern || inputs.pattern.test(release.tag_name)));

                const latestRelease: any = findLatestRelease(releaseList);
                if (latestRelease != null)
                    setOutputs(latestRelease, inputs.debug);
                else notFoundRelease('The latest release was not found', inputs.throwing);
            } else
                throw new Error(`Unexpected http ${listResponse.status} during get release list`);
        }
    } catch (err) {
        core.setFailed(err.message);
    }
})();
