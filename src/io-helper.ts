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
