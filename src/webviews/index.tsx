// eslint-disable-next-line import/no-internal-modules
import { createRoot } from 'react-dom/client';
import { WebviewApi, WithWebviewContext } from './WebviewContext';


export function render(vscodeApi: WebviewApi, publicPath: string, rootId = 'root'): void {
    const container = document.getElementById(rootId);
    if (!container) {
        throw new Error(`Element with id of ${rootId} not found.`);
    }

    // TODO: avoid using __webpack_public_path__
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    __webpack_public_path__ = publicPath;

    const root = createRoot(container);

    root.render(
        <WithWebviewContext vscodeApi={vscodeApi}>
            <button>yay from react</button>
        </WithWebviewContext>,
    );
}
