/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { callWithTelemetryAndErrorHandling, IActionContext, ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { AppResource, AppResourceResolver } from "@microsoft/vscode-azext-utils/hostapi";
import { ResolvedMongoVCoreAccountResource } from "./ResolvedMongoVCoreAccountResource";


const supportedResourceTypes = [
    'microsoft.documentdb/mongoclusters'
];

export class MongoVCoreResolver implements AppResourceResolver {
    public async resolveResource(subContext: ISubscriptionContext, resource: AppResource): Promise<ResolvedMongoVCoreAccountResource | null | undefined> {
        return await callWithTelemetryAndErrorHandling('resolveResource', async (context: IActionContext) => {
            try {
                console.log('🚀 Resolving: ' + resource.id);

                switch (resource.type.toLowerCase()) {
                    case supportedResourceTypes[0]: {
                        return new ResolvedMongoVCoreAccountResource(subContext, resource.id, resource.name, resource);
                    }
                    default:
                        return null;
                }
            } catch (e) {
                console.error({ ...context, ...subContext });
                throw e;
            }
        });
    }

    public matchesResource(resource: AppResource): boolean {
        return supportedResourceTypes.includes(resource.type.toLowerCase());
    }
}
