// eslint-disable-next-line import/no-internal-modules
import { JSX } from 'react';
import './my-styles.scss';

import { Button } from '@fluentui/react-components';

const MyButton = (): JSX.Element => {
    return (
        <button className="my-button">
            We're react!
        </button>
    );
}

export const CollectionView = (): JSX.Element => {
    return (
        <div>
            <div style={{ display: 'flex' }}>
                <MyButton />
            </div>
            <div style={{ display: 'flex', marginTop: 10 }}>
                <div>yay</div>
            </div>
            < div style={{ display: 'flex', margin: 50 }}>
                <Button appearance="primary">Fluent UI 9</Button>
            </div>
        </div>
    );
};
