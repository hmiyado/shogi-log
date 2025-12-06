import { render } from 'preact';
import { Layout } from '../components/Layout';
import { KifuViewer } from '../pages/KifuViewer';
import '../styles/index.css';

function App() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';
    const date = params.get('date') || '';

    return (
        <Layout>
            <KifuViewer id={id} date={date} />
        </Layout>
    );
}

const root = document.getElementById('app');
if (root) {
    render(<App />, root);
}
