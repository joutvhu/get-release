import * as core from '@actions/core';
import {getOctokit} from '@actions/github';
import {getInputs, isBlank, isNotBlank, ReleaseInputs, setOutputs} from './io-helper';

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

export function handlerError(message: string, throwing: boolean) {
    if (throwing)
        throw new Error(message);
    else core.warning(message);
}

(async function run() {
    try {
        const inputs: ReleaseInputs = getInputs();
        const github = getOctokit(process.env.GITHUB_TOKEN as string);

        core.info(`Start get release with:\n  owner: ${inputs.owner}\n  repo: ${inputs.repo}`);

        if (!inputs.latest) {
            if (isBlank(inputs.tag))
                handlerError('Current release not found', inputs.throwing);
            else {
                try {
                    // Get a release from the tag name
                    const releaseResponse = await github.rest.repos
                        .getReleaseByTag({
                            owner: inputs.owner,
                            repo: inputs.repo,
                            tag: inputs.tag
                        });

                    if (isSuccessStatusCode(releaseResponse.status))
                        setOutputs(releaseResponse.data, inputs.debug);
                    else
                        throw new Error(`Unexpected http ${releaseResponse.status} during get release`);
                } catch (e: any) {
                    if (e.status === 404)
                        handlerError(`No release has been found with ${inputs.tag} tag`, inputs.throwing);
                    else
                        handlerError(e.message, inputs.throwing);
                }
            }
        } else {
            const listResponse = await github.rest.repos.listReleases({
                owner: inputs.owner,
                repo: inputs.repo
            });

            if (isSuccessStatusCode(listResponse.status)) {
                const releaseList = listResponse.data
                    .filter(release => !release.draft &&
                        (!release.prerelease || inputs.prerelease) &&
                        (!inputs.pattern || inputs.pattern.test(release.tag_name)));

                const latestRelease: any = findLatestRelease(releaseList);
                if (isNotBlank(latestRelease))
                    setOutputs(latestRelease, inputs.debug);
                else {
                    if (!!inputs.pattern)
                        handlerError(`No release had a tag name matching /${inputs.pattern.source}/`,
                            inputs.throwing);
                    else
                        handlerError('The latest release was not found',
                            inputs.throwing);
                }
            } else
                throw new Error(`Unexpected http ${listResponse.status} during get release list`);
        }

        core.info('Get release has finished successfully');
    } catch (err: any) {
        core.setFailed(err.message);
    }
})();
