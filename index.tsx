
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("ZYRO: Initializing main application orbit...");

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    console.log("ZYRO: Render cycle initiated.");
  } catch (err) {
    console.error("ZYRO CRITICAL: Failed to mount application.", err);
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: #ff4444; font-family: sans-serif; text-align: center;">
        <h1 style="margin-bottom: 1rem;">System Launch Failed</h1>
        <p style="color: #888;">The virtual guide encountered a terminal error during initialization.</p>
        <code style="background: #111; padding: 1rem; display: block; margin-top: 1rem; border-radius: 8px;">${err.message}</code>
      </div>
    `;
  }
} else {
  console.error("ZYRO: Critical DOM Error - Root element not found.");
}
