// eslint-disable-next-line import/no-internal-modules
import { JSX } from 'react';
import './my-styles.scss';

import { Button, Input } from '@fluentui/react-components';
import { PlayRegular, SearchFilled } from "@fluentui/react-icons";


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
                <Input contentBefore={<SearchFilled />} />
                <Button icon={<PlayRegular />} appearance="primary">Run Find Query</Button>
            </div>
        </div>
    );
};
