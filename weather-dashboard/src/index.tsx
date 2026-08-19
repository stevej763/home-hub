import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/big-shoulders-display/600';
import '@fontsource/big-shoulders-display/700';
import '@fontsource/ibm-plex-serif/400';
import '@fontsource/ibm-plex-serif/500';
import '@fontsource/ibm-plex-serif/600';
import '@fontsource/ibm-plex-mono/400';
import '@fontsource/ibm-plex-mono/500';
import '@fontsource/ibm-plex-mono/600';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
