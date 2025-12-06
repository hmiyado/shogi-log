import { render } from 'preact';
import { Layout } from '../components/Layout';
import { PlayerStatsPage } from '../pages/PlayerStatsPage';
import '../styles/index.css';

function App() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name') || '';

    return (
        <Layout>
            <PlayerStatsPage name={name} />
        </Layout>
    );
}

const root = document.getElementById('app');
if (root) {
    render(<App />, root);
}
