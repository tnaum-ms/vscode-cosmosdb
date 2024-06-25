/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: remove the eslint exception once this class is implemented
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import { AzExtTreeItem, AzureWizard, GenericTreeItem, IActionContext, ISubscriptionContext, callWithTelemetryAndErrorHandling, nonNullProp } from "@microsoft/vscode-azext-utils";
import { AppResource, ResolvedAppResourceBase } from "@microsoft/vscode-azext-utils/hostapi";
import { getThemeAgnosticIconPath } from "../constants";
import { IMongoTreeRoot } from "../mongo/tree/IMongoTreeRoot";

import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ListDatabasesResult, MongoClient } from "mongodb";
import * as vscode from 'vscode';
import { createCosmosDBClient } from "../utils/azureClients";
import { localize } from "../utils/localize";
import { IAuthenticateWizardContext } from "../vCore/wizards/authenticate/IAuthenticateWizardContext";
import { ProvidePasswordStep } from "../vCore/wizards/authenticate/ProvidePasswordStep";
import { SelectUserNameStep } from "../vCore/wizards/authenticate/SelectUserNameStep";



export interface IDatabaseInfo {
    name?: string;
    empty?: boolean;
}

export class ResolvedMongoVCoreAccountResource implements ResolvedAppResourceBase {

    public static kind = 'microsoft.documentdb/mongoclusters' as const;

    public static contextValue: string = "cosmosDBMongoServer";
    //public readonly contextValue: string = MongoVCoreAccountTreeItem.contextValue;
    public readonly childTypeLabel: string = "Database";
    public readonly label: string;
    public readonly connectionString: string;
    // private readonly subscriptionContext: ISubscriptionContext;

    private _root: IMongoTreeRoot;

    constructor(subContext: ISubscriptionContext, id: string, label: string, resource: AppResource) {
        //super(undefined);
        //this.subscriptionContext = subContext;
        this.id = id;
        this.label = label;
        this._resource = resource;
        this._subscription = subContext;
        //this.connectionString = connectionString;
        //this._root = { isEmulator };
        this.description = "(count databases...)";
        //this.valuesToMask.push(connectionString);

    }
    _resource: AppResource;
    _subscription: ISubscriptionContext;
    kind: 'microsoft.documentdb/mongoclusters';
    fullId?: undefined;
    parent?: undefined;
    treeDataProvider?: undefined;
    valuesToMask?: undefined;
    collapsibleState?: undefined;
    suppressMaskLabel?: undefined;
    id?: string | undefined;
    description?: string | undefined;
    commandId?: string | undefined;
    tooltip?: string | undefined;
    initialCollapsibleState?: vscode.TreeItemCollapsibleState | undefined;
    commandArgs?: unknown[] | undefined;
    contextValue?: undefined;

    // createChildImpl?(context: ICreateChildImplContext): Promise<AzExtTreeItem> {
    //     throw new Error('Method not implemented.');
    // }
    // compareChildrenImpl?(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
    //     throw new Error('Method not implemented.');
    // }
    // pickTreeItemImpl?(expectedContextValues: (string | RegExp)[], context: IActionContext): AzExtTreeItem | Promise<AzExtTreeItem | undefined> | undefined {
    //     throw new Error('Method not implemented.');
    // }
    // deleteTreeItemImpl?(context: IActionContext): Promise<void> {
    //     throw new Error('Method not implemented.');
    // }
    // refreshImpl?(context: IActionContext): Promise<void> {
    //     throw new Error('Method not implemented.');
    // }
    // isAncestorOfImpl?(contextValue: string | RegExp): boolean {
    //     throw new Error('Method not implemented.');
    // }
    // resolveTooltip?(): Promise<string | vscode.MarkdownString> {
    //     throw new Error('Method not implemented.');
    // }
    contextValuesToAdd?: string[] | undefined;

    // overrides ISubscriptionContext with an object that also has Mongo info
    public get root(): IMongoTreeRoot {
        return this._root;
    }

    public get iconPath(): string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri } {
        return getThemeAgnosticIconPath('CosmosDBAccount.svg');
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }



    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        const result = await callWithTelemetryAndErrorHandling('vCore.loadMoreChildrenImpl', async (context: IActionContext): Promise<AzExtTreeItem[]> => {
            context.errorHandling.suppressDisplay = true;
            context.errorHandling.rethrow = true;

            void vscode.window.showInformationMessage('Loading Cluster Details for ' + this._resource.name + '...');
            const resourceGroupName = getResourceGroupFromId(nonNullProp(this._resource, 'id'));

            const client = await createCosmosDBClient({ ...context, ...this._subscription });
            const mongoCluster = await client.mongoClusters.get(resourceGroupName, this._resource.name);

            const login = mongoCluster.administratorLogin;
            const cString = mongoCluster.connectionString;

            const cStrings = await client.mongoClusters.listConnectionStrings(resourceGroupName, this._resource.name);

            const wizardContext: IAuthenticateWizardContext = { ...context,
                adminUserName: login as string,
                otherUserNames: ['user1', 'user2', 'user3'],
                resourceName: this._resource.name
             };

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const wizard = new AzureWizard(wizardContext, {
                promptSteps: [new SelectUserNameStep(), new ProvidePasswordStep()],
                title : localize('authenticatevCoreCluster', 'Authenticate to your vCore Cluster')
            });

            await wizard.prompt();

            void vscode.window.showInformationMessage('Connecting to vCore...');

            const cStringUser = cString?.replace('<user>', nonNullProp(wizardContext, 'selectedUserName'));
            const cStringPassword = cStringUser?.replace('<password>', nonNullProp(wizardContext, 'password'));


            const mongoClient: MongoClient | undefined = await MongoClient.connect(cStringPassword as string);

            void vscode.window.showInformationMessage('Listing databases...');

            const rDatabases: ListDatabasesResult = await mongoClient.db('test').admin().listDatabases();
            const databases: IDatabaseInfo[] = rDatabases.databases;


            return databases.map(
                database => new GenericTreeItem(undefined, {
                    contextValue: database.name as string,
                    label: database.name as string
                })
            );


            // // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            // const vCore = await client.mongoClusters.get(resourceGroupName, this._resource.name)
            // //.mongoClusters.get(resourceGroupName, 'asdf');

            // const result: AzExtTreeItem[] = [];
            // result.push(new GenericTreeItem(undefined, {
            //     contextValue: 'cosmosDBAttachEmulator',
            //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            //     label: mongoCluster.location,
            //     commandId: 'cosmosDB.attachEmulator',
            //     includeInTreeItemPicker: true
            // }));

            // return result;

        });

        if (result === undefined) {
            return [];
        } else {
            return result;
        }
    }


    // try {

    //     const resourceGroupName = getResourceGroupFromId(nonNullProp(this._resource, 'id'));

    //     const client = await createCosmosDBClient({ context, ...this._subscription });


    //     const databaseAccount = await client.databaseAccounts.get(resourceGroupName, this.name);



    //     const result: AzExtTreeItem[] = [];
    //     result.push(new GenericTreeItem(undefined, {
    //         contextValue: 'cosmosDBAttachEmulator',
    //         label: 'Attach ',
    //         commandId: 'cosmosDB.attachEmulator',
    //         includeInTreeItemPicker: true
    //     }));

    //     return result;

    // } catch (error) {
    //     const message = parseError(error).message;
    //     if (this._root.isEmulator && message.includes("ECONNREFUSED")) {
    //         // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    //         error.message = `Unable to reach emulator. See ${Links.LocalConnectionDebuggingTips} for debugging tips.\n${message}`;
    //     }
    //     throw error;
    // }
    // return [];


    // public async createChildImpl(context: ICreateChildImplContext): Promise<MongoDatabaseTreeItem> {
    //     const databaseName = await context.ui.showInputBox({
    //         placeHolder: "Database Name",
    //         prompt: "Enter the name of the database",
    //         stepName: 'createMongoDatabase',
    //         validateInput: validateDatabaseName
    //     });
    //     context.showCreatingTreeItem(databaseName);

    //     return new MongoDatabaseTreeItem(this, databaseName, this.connectionString);
    // }

    // public isAncestorOfImpl(contextValue: string): boolean {
    //     switch (contextValue) {
    //         case MongoDatabaseTreeItem.contextValue:
    //         case MongoCollectionTreeItem.contextValue:
    //         case MongoDocumentTreeItem.contextValue:
    //             return true;
    //         default:
    //             return false;
    //     }
    // }

    // public async deleteTreeItemImpl(context: IDeleteWizardContext): Promise<void> {
    //     await deleteCosmosDBAccount(context, this);
    // }
}


