// eslint-disable-next-line import/no-internal-modules
import './my-styles.scss';

const MyButton = () => {
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
        </div>
    );
};
