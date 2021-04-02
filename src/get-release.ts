import * as core from '@actions/core';
import {context, getOctokit} from '@actions/github';
import {getInputs, ReleaseInputs, setOutputs} from './io-helper';

export function isSuccessStatusCode(statusCode?: number): boolean {
    if (!statusCode) return false;
    return statusCode >= 200 && statusCode < 300;
}

export function findLatestRelease(releases: any[]): any {
    let result: any, latest: number = 0;

    releases.forEach(release => {
        const publishedDate: number = release.published_at ? Date.parse(release.published_at) : 0;
        if (result == null || latest < publishedDate) {
            result = release;
            latest = publishedDate;
        }
    });

    return result;
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
                setOutputs(releaseResponse.data);
            else {
                throw new Error(`Unexpected http ${releaseResponse.status} during get release`);
            }
        } else {
            const listResponse = await github.repos.listReleases({owner, repo});

            if (isSuccessStatusCode(listResponse.status)) {
                const releaseList = listResponse.data
                    .filter(release =>
                        (!release.prerelease || inputs.prerelease) &&
                        (!release.draft || inputs.draft));

                // Find the latest release by `published_at`
                const latestRelease: any = findLatestRelease(releaseList);
                if (latestRelease != null)
                    setOutputs(latestRelease);
                else core.info('The latest release was not found');
            } else {
                throw new Error(`Unexpected http ${listResponse.status} during get release list`);
            }
        }
    } catch (err) {
        core.setFailed(err.message);
    }
})();
