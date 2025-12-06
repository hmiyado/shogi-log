import { render } from 'preact';
import { Layout } from '../components/Layout';
import { Home } from '../pages/Home';
import '../styles/index.css';

function App() {
    return (
        <Layout>
            <Home />
        </Layout>
    );
}

const root = document.getElementById('app');
if (root) {
    render(<App />, root);
}
