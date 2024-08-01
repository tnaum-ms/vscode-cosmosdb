
import React = require("react");


//Insert this into your App.tsx file after the imports.
interface vscode {
    postMessage(message: unknown): void;
}
declare const vscode: vscode;

const sendMessage = () => {
    console.log('button clicked')
    vscode.postMessage({ command: 'testing' });
}

function MyButton({ title }: { title: string }) {
    return (
        <button onClick={sendMessage}>{title}</button>
    );
}

export default function collectionWidget(): React.JSX.Element {
    return (
        <div>
            <h1>React App</h1>
            <MyButton title="I'm a REACT button" />
        </div >
    );
}
