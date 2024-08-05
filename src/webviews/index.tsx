// eslint-disable-next-line import/no-internal-modules
import { createRoot } from 'react-dom/client';
import { WebviewApi, WithWebviewContext } from './WebviewContext';
import { CollectionView } from './vCore/collectionView';

import { FluentProvider, webLightTheme } from '@fluentui/react-components';


export const Views = {
    1: CollectionView,
} as const;

export type ViewKey = keyof typeof Views;


export function render(vscodeApi: WebviewApi, publicPath: string, rootId = 'root'): void {
    const container = document.getElementById(rootId);
    if (!container) {
        throw new Error(`Element with id of ${rootId} not found.`);
    }

    // TODO: avoid using __webpack_public_path__
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    __webpack_public_path__ = publicPath;

    const Component: React.ComponentType = Views[1];

    const root = createRoot(container);

    root.render(
        <FluentProvider theme={webLightTheme}>
            <WithWebviewContext vscodeApi={vscodeApi}>
                <Component />
            </WithWebviewContext>
        </FluentProvider>
    );
}
