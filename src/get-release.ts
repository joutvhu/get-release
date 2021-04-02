import * as core from '@actions/core';
import {context} from '@actions/github';
import {GitHub} from '@actions/github/lib/utils';
import {getInputs, ReleaseInputs, setOutputs} from './io-helper';

(async function run() {
    try {
        const inputs: ReleaseInputs = getInputs();
        // @ts-ignore
        const github = new GitHub(process.env.GITHUB_TOKEN);
        // Get owner and repo from context of payload that triggered the action
        const {owner, repo} = context.repo;


        if (!inputs.latest) {
            // Get a release from the tag name
            const releaseResponse = await github.repos
                .getReleaseByTag({owner, repo, tag: inputs.tag});

            core.setOutput('debug', releaseResponse);
            setOutputs(releaseResponse);
        } else {
            const listResponse = await github.repos.listReleases({owner, repo});
            listResponse.data.find(release => release.tag_name);
        }
    } catch (err) {
        core.setFailed(err.message);
    }
})();
