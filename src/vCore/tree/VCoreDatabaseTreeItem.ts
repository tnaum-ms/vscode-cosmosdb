import { AzExtParentTreeItem, AzExtTreeItem, GenericTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { VCoreClient, vCoreCollectionInfo } from "../VCoreClient";


export class VCoreDatabaseTreeItem extends AzExtParentTreeItem {
    databaseName: string;
    clientId: string;

    constructor(databaseName: string, clientId: string) {
        super(undefined);
        this.databaseName = databaseName;
        this.clientId = clientId;
        this.id = this.databaseName;
    }

    public get label(): string {
        return this.databaseName;
    }


    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon('database');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {

        // Add your implementation here
        const vCoreClient: VCoreClient = await VCoreClient.getClient(this.clientId);
        const collections: vCoreCollectionInfo[] = await vCoreClient.listCollections(this.databaseName);


        return collections.map(
            collection => new GenericTreeItem(undefined, {
                contextValue: collection.name as string,
                label: collection.name as string,
                description: ''
            })
        );
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public contextValue: string;
}

