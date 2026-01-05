import { useEffect, useRef, useState } from 'react';
import './terminal.css';

const NAV_ITEMS = ['add interview', 'view interviews', 'interview summaries'];

export default function Terminal() {
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
        addToHistory([{ type: 'info', text: `selected ${NAV_ITEMS[selectedNav]}` }]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNav]);

  const addToHistory = (entries) => setHistory((prev) => [...prev, ...entries]);

  const fetchInterviews = async () => {
    const res = await fetch(`${API_BASE}/interviews`);
    if (!res.ok) throw new Error('Failed to fetch interviews');
    return res.json();
  };

  const addInterview = async (name, mp3_path, guilt_level) => {
    const res = await fetch(`${API_BASE}/interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mp3_path, guilt_level: Number(guilt_level) })
    });
    if (!res.ok) throw new Error('Failed to add interview');
    return res.json();
  };

  const handleCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addToHistory([{ type: 'input', text: `$ ${trimmed}` }]);
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setIsProcessing(true);

    const [command, ...args] = trimmed.toLowerCase().split(' ');

    try {
      switch (command) {
        case 'help':
          addToHistory([
            { type: 'system', text: '' },
            { type: 'system', text: 'available commands' },
            { type: 'system', text: '──────────────────────────' },
            { type: 'info', text: 'list                list interviews' },
            { type: 'info', text: 'add <name> <path> <guilt>' },
            { type: 'info', text: 'clear               clear log' },
            { type: 'info', text: 'about               info blurb' },
            { type: 'system', text: '' }
          ]);
          break;

        case 'list': {
          addToHistory([{ type: 'info', text: 'fetching interviews…' }]);
          const interviews = await fetchInterviews();
          if (interviews.length === 0) {
            addToHistory([
              { type: 'warning', text: 'no interviews in database yet' },
              { type: 'system', text: '' }
            ]);
          } else {
            const output = [
              { type: 'success', text: `${interviews.length} interview(s)` },
              { type: 'system', text: '──────────────────────────' }
            ];
            interviews.forEach((iv, idx) => {
              output.push(
                { type: 'data', text: `[${idx + 1}] ${iv.name || 'unknown'}` },
                { type: 'data', text: `    file: ${iv.mp3_path}` },
                { type: 'data', text: `    guilt: ${iv.guilt_level}/10` },
                { type: 'system', text: '' }
              );
            });
            addToHistory(output);
          }
          break;
        }

        case 'add': {
          if (args.length < 3) {
            addToHistory([
              { type: 'error', text: 'usage: add <name> <mp3_path> <guilt_level>' },
              { type: 'system', text: 'example: add "John" /audio/john.mp3 7' },
              { type: 'system', text: '' }
            ]);
          } else {
            const [name, path, guilt] = args;
            addToHistory([{ type: 'info', text: `adding interview for ${name}…` }]);
            await addInterview(name, path, guilt);
            addToHistory([
              { type: 'success', text: 'saved' },
              { type: 'system', text: '' }
            ]);
          }
          break;
        }

        case 'clear':
          setHistory([{ type: 'system', text: 'log cleared' }, { type: 'system', text: '' }]);
          break;

        case 'about':
          addToHistory([
            { type: 'system', text: '' },
            { type: 'info', text: 'murder-at-midnight investigation shell' },
            { type: 'info', text: `api base: ${API_BASE}` },
            { type: 'info', text: 'arrow keys move the menu' },
            { type: 'system', text: '' }
          ]);
          break;

        default:
          addToHistory([
            { type: 'error', text: `unknown command: ${command}` },
            { type: 'system', text: 'try "help"' },
            { type: 'system', text: '' }
          ]);
      }
    } catch (err) {
      addToHistory([
        { type: 'error', text: err.message },
        { type: 'system', text: '' }
      ]);
    }

    setIsProcessing(false);
  };

  const handleInputKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      if (historyIndex === -1) return;
      const nextIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
      if (nextIndex === historyIndex && nextIndex === commandHistory.length - 1) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    }
  };

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
              onClick={() => setSelectedNav(idx)}
            >
              <span className="caret">&gt;</span>
              <span className="nav-text">{item}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
