import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("ZYRO: Initializing main application orbit...");

// Global error handler for uncaught module errors or boot failures
window.onerror = function(message, source, lineno, colno, error) {
  console.error("ZYRO_SYSTEM: Global Error Caught:", message, "at", source, ":", lineno);
  const rootElement = document.getElementById('root');
  // Only show error HUD if the app hasn't mounted yet
  if (rootElement && rootElement.innerHTML === '') {
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: #ff4444; font-family: 'Space Mono', monospace; text-align: center; background: #000; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h1 style="margin-bottom: 1rem; font-size: 1.5rem; letter-spacing: -0.05em;">CRITICAL_SYSTEM_FAILURE</h1>
        <p style="color: #666; margin-bottom: 2rem; font-weight: bold; font-size: 0.9rem;">The neural link could not be established with the host.</p>
        <div style="background: #111; padding: 1.5rem; border: 1px solid #333; border-radius: 12px; max-width: 80%; text-align: left; overflow: auto;">
          <code style="color: #ff4444; font-size: 0.8rem; line-height: 1.4;">[ERROR_LOG]: ${message}</code>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 2rem; background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem;">RETRY_HANDSHAKE</button>
      </div>
    `;
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    console.log("ZYRO: Creating React root...");
    const root = ReactDOM.createRoot(rootElement);
    console.log("ZYRO: Rendering App component in StrictMode...");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("ZYRO: Render cycle initiated successfully.");
  } catch (err: any) {
    console.error("ZYRO CRITICAL: Failed to mount application.", err);
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: #ff4444; font-family: 'Space Mono', monospace; text-align: center; background: #000; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h1 style="margin-bottom: 1rem; font-size: 1.5rem; letter-spacing: -0.05em;">LAUNCH_SEQUENCE_ABORTED</h1>
        <p style="color: #666; margin-bottom: 2rem; font-weight: bold; font-size: 0.9rem;">The virtual guide encountered a terminal error during initialization.</p>
        <div style="background: #111; padding: 1.5rem; border: 1px solid #333; border-radius: 12px; max-width: 80%; text-align: left; overflow: auto;">
          <code style="color: #ff4444; font-size: 0.8rem; line-height: 1.4;">[CORE_ERROR]: ${err?.message || 'Unknown Orbital Error'}</code>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 2rem; background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem;">RETRY_BOOT</button>
      </div>
    `;
  }
} else {
  console.error("ZYRO: Critical DOM Error - Root element not found.");
}