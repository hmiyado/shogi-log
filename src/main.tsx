import { render } from 'preact';
import { LocationProvider } from 'preact-iso';
import { App } from './components/App';
import './styles/index.css';

const root = document.getElementById('app');
if (root) {
    render(
        <LocationProvider>
            <App />
        </LocationProvider>,
        root
    );
}
