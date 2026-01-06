import { useEffect, useMemo, useRef, useState } from 'react';
import './components/terminal.css';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

export default function AddInterview() {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingState, setRecordingState] = useState('idle'); // idle | recording | recorded
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const safeFileName = useMemo(() => {
    if (!name.trim()) return 'recording.webm';
    return `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'recording'}.webm`;
  }, [name]);

  const startRecording = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setFile(new File([blob], safeFileName, { type: 'audio/webm' }));
        setAudioUrl(url);
        setRecordingState('recorded');
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setStatus('recording...');
    } catch (err) {
      setError('Microphone permission denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('recorded');
      setStatus('recorded');
    }
  };

  const onFilePick = (evt) => {
    setError('');
    const picked = evt.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setAudioUrl(URL.createObjectURL(picked));
    setRecordingState('recorded');
    setStatus('file ready');
  };

  const submit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!file) {
      setError('Attach or record an audio file first.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('file', file);

    setIsSaving(true);
    setStatus('uploading...');
    try {
      const res = await fetch(`${API_BASE}/interview`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save interview');
      }
      setTranscript(data.transcript || '');

      // Immediately trigger guilt analysis in the background
      setStatus('analyzing...');
      try {
        const analyzeForm = new FormData();
        analyzeForm.append('name', name.trim());
        const analyzeRes = await fetch(`${API_BASE}/analyze`, {
          method: 'POST',
          body: analyzeForm,
        });
        const analyzeData = await analyzeRes.json();
        if (!analyzeRes.ok || analyzeData.error) {
          throw new Error(analyzeData.error || 'Analysis failed');
        }
        setStatus('saved & analyzed');
      } catch (anErr) {
        // Keep the save success but surface analysis issue
        setStatus('saved (analysis failed)');
        setError(anErr.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to save interview');
      setStatus('ready');
      setTranscript('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="terminal-page">
      <div className="noise-layer" aria-hidden="true"></div>
      <div className="panel" style={{ width: 'min(960px, 92vw)', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <p className="title" style={{ marginBottom: '4px' }}>add interview</p>
            <p className="log-line log-info" style={{ margin: 0, opacity: 0.9 }}>
              Same name will overwrite the existing interview.
            </p>
          </div>
          <div className="pill right-pill" style={{ position: 'relative', right: 0, bottom: 0 }}>
            <span className="pill-dot" style={{ background: recordingState === 'recording' ? '#ff6b6b' : '#2d2540' }}></span>
            <span className="pill-text">{status}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <label style={{ color: '#ffe4b5', fontWeight: 600, fontSize: '14px' }}>Interview name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. suspect #12"
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '2px solid #ffe4b5',
                background: '#2d2540',
                color: '#fff3d6',
                fontSize: '16px',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            />

            <div style={{ display: 'grid', gap: '12px', marginTop: '8px' }}>
              <p className="log-line log-info" style={{ margin: 0 }}>Attach an audio file or record here.</p>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '2px dashed #ffe4b5',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: '#ffe4b5'
                }}
              >
                <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={onFilePick} />
                <span style={{ fontWeight: 700 }}>upload</span>
                <span className="log-line log-muted" style={{ fontSize: '13px' }}>{file ? file.name : 'audio or mp3/webm'}</span>
              </label>
            </div>
          </div>

          <div style={{
            border: '2px solid #ffe4b5',
            borderRadius: '12px',
            padding: '16px',
            background: '#2d2540',
            display: 'grid',
            gap: '12px'
          }}>
            <p className="log-line log-info" style={{ margin: 0 }}>Recorder</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={startRecording}
                disabled={recordingState === 'recording'}
                className="nav-item"
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '2px solid #ff6b6b',
                  background: '#3a2f52',
                  color: '#ff6b6b',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                start
              </button>
              <button
                onClick={stopRecording}
                disabled={recordingState !== 'recording'}
                className="nav-item"
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '2px solid #ffe4b5',
                  background: '#2d2540',
                  color: '#ffe4b5',
                  fontWeight: 700,
                  cursor: recordingState === 'recording' ? 'pointer' : 'not-allowed'
                }}
              >
                stop
              </button>
            </div>

            {audioUrl && (
              <div style={{ display: 'grid', gap: '6px' }}>
                <p className="log-line log-info" style={{ margin: 0 }}>Preview</p>
                <audio controls src={audioUrl} style={{ width: '100%' }} />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="log-line log-error" style={{ marginTop: '8px' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={submit}
            disabled={isSaving}
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              border: '3px solid #ff6b6b',
              background: '#2d2540',
              color: '#ff6b6b',
              fontWeight: 700,
              cursor: isSaving ? 'wait' : 'pointer',
              minWidth: '160px'
            }}
          >
            {isSaving ? 'saving...' : 'save interview'}
          </button>
        </div>

        {transcript && (
          <div style={{ marginTop: '16px' }}>
            <p className="log-line log-info" style={{ margin: 0 }}>Transcript</p>
            <div
              style={{
                marginTop: '8px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '2px solid #ffe4b5',
                background: '#2d2540',
                color: '#fff3d6',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {transcript}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}