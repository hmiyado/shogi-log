import { render } from 'preact';
import { Layout } from '../components/Layout';
import { StatisticsPage } from '../pages/StatisticsPage';
import '../styles/index.css';

function App() {
    return (
        <Layout>
            <StatisticsPage />
        </Layout>
    );
}

const root = document.getElementById('app');
if (root) {
    render(<App />, root);
}
