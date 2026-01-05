import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Terminal from './components/Terminal';
import AddInterview from './Add-Interview';
import Interviews from './interviews'
import Summaries from './summaries'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Terminal />
  </React.StrictMode>
);
