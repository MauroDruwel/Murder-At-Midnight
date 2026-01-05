import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

export default function TerminalPage() {
  const [output, setOutput] = useState([
    '> System initialized...',
    '> Welcome to Murder At Midnight Interview System',
    `> Target API: ${API_BASE}`,
    '> Ready for input...'
  ]);
  const [interviews, setInterviews] = useState([]);
  const [form, setForm] = useState({ name: '', file: null });
  const [analyzeName, setAnalyzeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const log = (...lines) => setOutput((prev) => [...prev, ...lines]);

  const fetchInterviews = async () => {
    setLoading(true);
    setError(null);
    log('> see_reviews', '> Loading interviews...');
    try {
      const res = await fetch(`${API_BASE}/interviews`);
      if (!res.ok) throw new Error('Failed to load interviews');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setInterviews(list);
      if (list.length && !analyzeName) {
        setAnalyzeName(list[0].name || '');
      }
      log(`> Loaded ${list.length} interviews`);
    } catch (err) {
      setError(err.message);
      log(`! ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleAddInterview = async () => {
    if (!form.name || !form.file) {
      const msg = 'Name and audio/video file are required.';
      setError(msg);
      log('! add_interview', `! ${msg}`);
      return;
    }
    setLoading(true);
    setError(null);
    log(`> add_interview ${form.name}`, '> Uploading media file...');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('file', form.file);
      const res = await fetch(`${API_BASE}/interview`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Upload failed');
      }
      log('> Transcript generated', '> Interview saved');
      setForm({ name: '', file: null });
      await fetchInterviews();
    } catch (err) {
      setError(err.message);
      log(`! ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analyzeName) {
      const msg = 'Select an interview to analyze.';
      setError(msg);
      log('! analyze', `! ${msg}`);
      return;
    }
    setLoading(true);
    setError(null);
    log(`> review_summary ${analyzeName}`, '> Analyzing guilt...');
    try {
      const fd = new FormData();
      fd.append('name', analyzeName);
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Analyze failed');
      log(`> Guilt level for ${analyzeName}: ${data.guilt_level}`);
      // Update local state with new guilt level
      setInterviews((prev) =>
        prev.map((iv) =>
          iv.name === analyzeName ? { ...iv, guilt_level: data.guilt_level } : iv
        )
      );
    } catch (err) {
      setError(err.message);
      log(`! ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    if (!interviews.length) return 'No interviews yet.';
    const scored = interviews.filter((iv) => typeof iv.guilt_level === 'number' && iv.guilt_level >= 0);
    if (!scored.length) return 'No guilt scores yet.';
    const avg = (scored.reduce((s, iv) => s + iv.guilt_level, 0) / scored.length).toFixed(2);
    return `Average guilt: ${avg} across ${scored.length} analyzed interviews.`;
  }, [interviews]);

  return (
    <div className="min-h-screen bg-black p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-gray-900 rounded-lg shadow-2xl border border-green-500">
        <div className="bg-gray-800 rounded-t-lg p-3 flex items-center gap-2 border-b border-green-500">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-gray-400 font-mono text-sm">terminal@murder-at-midnight</span>
          {loading && <span className="ml-auto text-xs text-green-300">processing...</span>}
        </div>

        <div className="p-6 grid gap-8 md:grid-cols-[2fr_1fr] font-mono text-green-400">
          <div className="space-y-4">
            <div className="space-y-2 min-h-[220px] bg-gray-950/60 border border-green-500/40 rounded p-4">
              {output.map((line, index) => (
                <div key={index} className="text-sm">
                  {line}
                </div>
              ))}
              <div className="flex items-center">
                <span className="mr-2">{'>'}</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>

            <div className="border-t border-green-500/30 pt-4 space-y-3">
              <div className="text-sm text-gray-500">Available commands:</div>
              <button
                onClick={handleAddInterview}
                className="block w-full text-left hover:bg-green-900/30 hover:text-green-300 py-1 px-2 rounded transition-colors"
                disabled={loading}
              >
                <span className="text-gray-500">{'>'}</span> add_interview
              </button>
              <button
                onClick={fetchInterviews}
                className="block w-full text-left hover:bg-green-900/30 hover:text-green-300 py-1 px-2 rounded transition-colors"
                disabled={loading}
              >
                <span className="text-gray-500">{'>'}</span> see_reviews
              </button>
              <button
                onClick={handleAnalyze}
                className="block w-full text-left hover:bg-green-900/30 hover:text-green-300 py-1 px-2 rounded transition-colors"
                disabled={loading}
              >
                <span className="text-gray-500">{'>'}</span> review_summary
              </button>
              {error && <div className="text-red-400 text-sm">! {error}</div>}
            </div>
          </div>

          <div className="space-y-6 text-sm text-green-200">
            <div className="space-y-3 border border-green-500/30 rounded p-4">
              <div className="text-green-300 font-semibold">Add / Update Interview</div>
              <input
                className="w-full bg-gray-800 text-green-200 border border-green-500/40 rounded px-3 py-2"
                placeholder="Interview name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={loading}
              />
              <input
                className="w-full bg-gray-800 text-green-200 border border-green-500/40 rounded px-3 py-2 file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-green-700 file:text-white"
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                disabled={loading}
              />
              {form.file && (
                <div className="text-xs text-gray-400">
                  Selected: {form.file.name} ({form.file.type || 'unknown type'})
                </div>
              )}
              <button
                onClick={handleAddInterview}
                className="w-full bg-green-700 text-white rounded py-2 hover:bg-green-600 transition-colors disabled:opacity-60"
                disabled={loading}
              >
                Upload & Transcribe
              </button>
            </div>

            <div className="space-y-3 border border-green-500/30 rounded p-4">
              <div className="text-green-300 font-semibold">Analyze Guilt</div>
              <select
                className="w-full bg-gray-800 text-green-200 border border-green-500/40 rounded px-3 py-2"
                value={analyzeName}
                onChange={(e) => setAnalyzeName(e.target.value)}
                disabled={loading || !interviews.length}
              >
                <option value="">Select interview</option>
                {interviews.map((iv) => (
                  <option key={iv.name} value={iv.name}>
                    {iv.name || '(unnamed)'}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAnalyze}
                className="w-full bg-green-700 text-white rounded py-2 hover:bg-green-600 transition-colors disabled:opacity-60"
                disabled={loading || !interviews.length}
              >
                Analyze
              </button>
              <div className="text-xs text-gray-400">{summary}</div>
            </div>

            <div className="space-y-3 border border-green-500/30 rounded p-4 max-h-80 overflow-y-auto">
              <div className="text-green-300 font-semibold">Interviews</div>
              {!interviews.length && <div className="text-gray-500">No interviews yet.</div>}
              {interviews.map((iv, idx) => (
                <div key={`${iv.name}-${idx}`} className="border border-green-500/20 rounded p-3 space-y-1">
                  <div className="text-green-200 font-semibold">{iv.name || 'Unnamed'}</div>
                  <div className="text-xs text-gray-400">Guilt level: {iv.guilt_level ?? 'n/a'}</div>
                  <div className="text-xs text-gray-400 truncate">Audio: {iv.mp3_path || 'n/a'}</div>
                  {iv.transcript && (
                    <div className="text-xs text-gray-300 line-clamp-3">
                      Transcript: {iv.transcript}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}