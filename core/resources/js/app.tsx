import { createRoot } from 'react-dom/client';
import App from './src/app/App';
import './src/styles/index.css';

const container = document.getElementById('app');

if (!container) {
  throw new Error('Could not find #app container');
}

const root = createRoot(container);
root.render(<App />);
