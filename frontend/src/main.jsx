import React from 'react';
import ReactDOM from 'react-dom/client';
import TerminalPage from './pages/main.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TerminalPage />
  </React.StrictMode>
);