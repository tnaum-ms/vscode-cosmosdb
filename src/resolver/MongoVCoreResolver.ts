/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CosmosDBManagementClient } from "@azure/arm-cosmosdb";
import { uiUtils } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, ISubscriptionContext, callWithTelemetryAndErrorHandling } from "@microsoft/vscode-azext-utils";
import { AppResource, AppResourceResolver } from "@microsoft/vscode-azext-utils/hostapi";
import { createCosmosDBClient } from "../utils/azureClients";
import { IMongoVCoreAccountDetails, ResolvedMongoVCoreAccountResource } from "./ResolvedMongoVCoreAccountResource";


const supportedResourceTypes = [
    'microsoft.documentdb/mongoclusters'
];


//only contains the fields we're currently interested in
interface IMongoVCoreDetails {
    serverVersion: string,
    sku: string
}

export class MongoVCoreResolver implements AppResourceResolver {

    private static _detailsMap: Map<string, IMongoVCoreDetails> = new Map<string, IMongoVCoreDetails>();

    private static _cosmosDBClient : CosmosDBManagementClient | undefined = undefined;

    public async resolveResource(subContext: ISubscriptionContext, resource: AppResource): Promise<ResolvedMongoVCoreAccountResource | null | undefined> {
        return await callWithTelemetryAndErrorHandling('resolveResource', async (context: IActionContext) => {
            try {
                console.log('🚀 Resolving: ' + resource.id);

                // TODO: this is only temporary until we have a better way to pull details potentially hidden in the 'resource' variable
                // once we have a better way to pull details from the resource, we can remove this switch statement
                // or move it to a more appropriate location in case we won't be able to remove this code
                // start of temporary code

                // fun experiment:

                if (MongoVCoreResolver._cosmosDBClient === undefined) {
                    MongoVCoreResolver._cosmosDBClient = await createCosmosDBClient({...context, ...subContext});
                    const allResourcesWithDetails = await uiUtils.listAllIterator(MongoVCoreResolver._cosmosDBClient.mongoClusters.list());

                    // a map for quick lookup
                    // TODO: P1: this is a temporary solution, I need to add expiration to this cache, any TS-built in solution?
                    allResourcesWithDetails.forEach((resource) => {
                        if (resource.nodeGroupSpecs) {
                            MongoVCoreResolver._detailsMap.set(resource.id as string,
                                {serverVersion: resource.serverVersion as string,
                                sku: resource.nodeGroupSpecs[0]?.sku as string});
                        }
                    });
                }



                // // eslint-disable-next-line @typescript-eslint/no-unused-vars
                // const httpHeaders: HttpHeaders =  createHttpHeaders({ 'Content-Type': 'application/json' });

                // const resourceGroupName = getResourceGroupFromId(nonNullProp(resource, 'id'));

                // // eslint-disable-next-line @typescript-eslint/no-unused-vars
                // const vCoreDetailsString = await MongoVCoreResolver._coreClient.sendRequest(
                //     {
                //         method: 'GET',
                //         url: `https://management.azure.com/subscriptions/${subContext.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.DocumentDB/mongoClusters/${resource.name}?api-version=2024-03-01-preview`,
                //         timeout: 0,
                //         headers: httpHeaders,
                //         withCredentials: false,
                //         requestId: ""
                //     },
                // );

                // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
                // const vCoreDetailsJSON: IMongoVCoreDetails = JSON.parse(vCoreDetailsString.bodyAsText as string);

                // const vCoreDetails: IMongoVCoreAccountDetails = {
                //     name: resource.name,
                //     resourceGroup: resourceGroupName,
                //     version: vCoreDetailsJSON.properties.serverVersion,
                //     sku: vCoreDetailsJSON.properties.nodeGroupSpecs[0].sku
                // };

                // end of temporary code

                const vCoreDetails: IMongoVCoreAccountDetails = {
                    name: resource.name,
                    version: MongoVCoreResolver._detailsMap.get(resource.id)?.serverVersion || undefined,
                    sku: MongoVCoreResolver._detailsMap.get(resource.id)?.sku || undefined
                }

                switch (resource.type.toLowerCase()) {
                    case supportedResourceTypes[0]: {
                        return new ResolvedMongoVCoreAccountResource(subContext, resource.id, vCoreDetails, resource);
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


