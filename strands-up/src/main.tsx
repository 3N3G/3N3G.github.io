/**
 * Main Entry Point
 * 
 * This file is the entry point for the React application.
 * It mounts the App component to the DOM and sets up React StrictMode.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
