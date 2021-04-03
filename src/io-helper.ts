import * as core from '@actions/core';
import {InputOptions} from '@actions/core';
import {context} from '@actions/github';
import {Inputs, Outputs} from './constants';

export interface ReleaseInputs {
    owner: string;
    repo: string;
    tag: string;

    latest: boolean;
    pattern: RegExp;
    prerelease: boolean;

    debug: boolean;
    throwing: boolean;
}

export function isBlank(value: any): boolean {
    return value === null || value === undefined || (value.length !== undefined && value.length === 0);
}

export function isNotBlank(value: any): boolean {
    return value !== null && value !== undefined && (value.length === undefined || value.length > 0);
}

export function getBooleanInput(name: string, options?: InputOptions): boolean {
    const value = core.getInput(name, options);
    return isNotBlank(value) &&
        ['y', 'yes', 't', 'true', 'e', 'enable', 'enabled', 'on', 'ok', '1']
            .includes(value.trim().toLowerCase());
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

    result.owner = core.getInput(Inputs.Owner, {required: false});
    if (isBlank(result.owner))
        result.owner = context.repo.owner;

    result.repo = core.getInput(Inputs.Repo, {required: false});
    if (isBlank(result.repo))
        result.repo = context.repo.repo;

    const tag = core.getInput(Inputs.TagName, {required: false});
    if (isNotBlank(tag))
        result.tag = tag.trim();
    else {
        if (typeof context.ref === 'string' && context.ref.startsWith('refs/tags/'))
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

export function setOutputs(response: any, log?: boolean) {
    // Get the outputs for the created release from the response
    let message = '';
    for (const key in Outputs) {
        const field: string = (Outputs as any)[key];
        if (log)
            message += `\n  ${field}: ${JSON.stringify(response[field])}`;
        core.setOutput(field, response[field]);
    }

    if (log)
        core.info('Outputs:' + message);
}
