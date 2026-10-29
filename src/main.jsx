import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles.css';

console.log('Mounting React application...');

try {
  const root = document.getElementById('root');
  if (!root) throw new Error('Cannot find #root element');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </React.StrictMode>,
  );
  console.log('Render call completed.');
} catch (err) {
  console.error('Fatal render error:', err);
  document.body.innerHTML = `
    <div style="padding: 24px; font-family: sans-serif; background: #fff0f0; color: #900;">
      <h2>Lỗi khởi động Web</h2>
      <pre>${err?.stack || err}</pre>
    </div>
  `;
}

