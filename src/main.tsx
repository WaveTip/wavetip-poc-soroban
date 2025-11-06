/**
 * Application Entry Point
 * 
 * Initializes React application and mounts root component.
 * Renders App with React StrictMode for development warnings.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

/**
 * Mount React application to DOM
 * - Targets #root element in index.html
 * - Wraps with StrictMode for development warnings and checks
 * - Loads global styles
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
