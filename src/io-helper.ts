import * as core from '@actions/core';
import {InputOptions} from '@actions/core';
import {context} from '@actions/github';
import {Inputs, Outputs} from './constants';

export interface ReleaseInputs {
    tag: string;

    latest: boolean;
    pattern: RegExp;
    prerelease: boolean;

    debug: boolean;
    throwing: boolean;
}

export function getBooleanInput(name: string, options?: InputOptions): boolean {
    const value = core.getInput(name, options);
    return value != null && value.length > 0 &&
        !['n', 'no', 'f', 'false', '0'].includes(value.toLowerCase());
}

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): ReleaseInputs {
    const result: ReleaseInputs | any = {
        latest: false,
        draft: false,
        prerelease: false
    };

    const tag = core.getInput(Inputs.TagName, {required: false});
    if (tag != null && tag.length > 0)
        result.tag = tag.trim();

    if (tag == null || tag.length === 0) {
        result.tag = context.ref.replace('refs/tags/', '');

        result.latest = getBooleanInput(Inputs.Latest, {required: false});
        if (result.latest) {
            const pattern = core.getInput(Inputs.Pattern, {required: false});
            if (typeof pattern === 'string') {
                try {
                    result.pattern = new RegExp(pattern);
                } catch (e) {
                    delete result.pattern;
                }
            }
            result.prerelease = getBooleanInput(Inputs.PreRelease, {required: false});
        }
    }

    result.debug = getBooleanInput(Inputs.Debug, {required: false});
    result.throwing = getBooleanInput(Inputs.Throwing, {required: false});

    return result;
}

export function setOutputs(outputs: any, log?: boolean) {
    // Get the outputs for the created release from the response
    const {
        id,
        node_id,
        url,
        html_url,
        upload_url,
        assets_url,
        name,
        tag_name,
        body,
        draft,
        prerelease,
        target_commitish,
        created_at,
        published_at
    } = outputs;

    if (log)
        core.debug(JSON.stringify(outputs));

    core.setOutput(Outputs.Id, id.toString());
    core.setOutput(Outputs.NodeId, node_id);
    core.setOutput(Outputs.Url, url);
    core.setOutput(Outputs.HtmlUrl, html_url);
    core.setOutput(Outputs.UploadUrl, upload_url);
    core.setOutput(Outputs.AssetsUrl, assets_url);
    core.setOutput(Outputs.TagName, tag_name);
    core.setOutput(Outputs.Name, name);
    core.setOutput(Outputs.Body, body);
    core.setOutput(Outputs.Draft, draft);
    core.setOutput(Outputs.PreRelease, prerelease);
    core.setOutput(Outputs.TargetCommitish, target_commitish);
    core.setOutput(Outputs.PreRelease, created_at);
    core.setOutput(Outputs.PreRelease, published_at);
}
