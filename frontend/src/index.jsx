import React from 'react';
import { createRoot } from 'react-dom/client';

// Import the App component from App.js
import App from './App';
import './styles.css';

// Get the root element from the DOM
const rootElement = document.getElementById('root');

// Create a root and render the App component
createRoot(rootElement).render(<App />);
