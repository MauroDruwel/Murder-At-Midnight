import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './terminal.css';

const NAV_ITEMS = ['add interview', 'view interviews', 'interview summaries'];
const NAV_ROUTES = ['/add-interview', '/interviews', '/summaries'];

export default function Terminal() {
  const navigate = useNavigate(); 
  const [history, setHistory] = useState([
    { type: 'system', text: 'murder-at-midnight // minimal shell' },
    { type: 'system', text: 'type "help" below or use arrow keys' },
    { type: 'system', text: '' }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNav, setSelectedNav] = useState(0);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [history]);

  const handleNavigation = (index) => {
    const route = NAV_ROUTES[index];
    addToHistory([{ type: 'info', text: `navigating to ${NAV_ITEMS[index]}...` }]);
    window.location.href = route;
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (document.activeElement === inputRef.current) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedNav((prev) => (prev + 1) % NAV_ITEMS.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedNav((prev) => (prev - 1 + NAV_ITEMS.length) % NAV_ITEMS.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleNavigation(selectedNav);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNav]);

  const addToHistory = (entries) => setHistory((prev) => [...prev, ...entries]);

  const getLineColor = (type) => {
    switch (type) {
      case 'input':
        return 'log-input';
      case 'success':
        return 'log-success';
      case 'error':
        return 'log-error';
      case 'warning':
        return 'log-warning';
      case 'info':
        return 'log-info';
      case 'data':
        return 'log-data';
      default:
        return 'log-muted';
    }
  };

  return (
    <div className="terminal-page">
      <div className="noise-layer" aria-hidden="true"></div>

      <div className="panel">
        <p className="title">murder-at-midnight terminal</p>

        <div className="nav-list">
          {NAV_ITEMS.map((item, idx) => (
            <button
              key={item}
              className={`nav-item ${selectedNav === idx ? 'active' : ''}`}
              onClick={() => handleNavigation(idx)}
            >
              <span className="caret">&gt;</span>
              <span className="nav-text">{item}</span>
            </button>
          ))}
        </div>

      </div>

      <div className="pill right-pill">
        <span className="arrow">▲</span>
        <span className="arrow">▼</span>
        <span className="pill-text">try using arrow keys!</span>
      </div>
    </div>
  );
}