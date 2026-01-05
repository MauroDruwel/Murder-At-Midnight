import { useState } from 'react';
import './components/terminal.css';


export default function AddInterview() {
  const [interviews, setInterviews] = useState([
    { id: 1, name: 'Interview 1' },
    { id: 2, name: 'Interview 2' },
    { id: 3, name: 'Interview 3' }
  ]);

  const handleAddInterview = () => {
    const newId = interviews.length + 1;
    setInterviews([...interviews, { id: newId, name: `Interview ${newId}` }]);
  };

  return (
    <div className="terminal-page">
      <div className="noise-layer" aria-hidden="true"></div>

      <div style={{
        position: 'relative',
        width: 'min(90vw, 1200px)',
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 700,
          color: '#fff3d6',
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          add interview
        </h1>

        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {interviews.map((interview) => (
            <div
              key={interview.id}
              style={{
                width: '180px',
                height: '120px',
                background: '#2d2540',
                border: '3px solid #fff3d6',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 120ms ease, box-shadow 120ms ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
              }}
            >
              <span style={{
                color: '#fff3d6',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'Space Grotesk, sans-serif'
              }}>
                {interview.name}
              </span>
            </div>
          ))}

          {/* Add button */}
          <button
            onClick={handleAddInterview}
            style={{
              width: '180px',
              height: '120px',
              background: '#2d2540',
              border: '3px solid #ff6b6b',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 120ms ease, box-shadow 120ms ease, background 120ms ease',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 107, 107, 0.4)';
              e.currentTarget.style.background = '#3a2f52';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.background = '#2d2540';
            }}
          >
            <span style={{
              color: '#ff6b6b',
              fontSize: '64px',
              fontWeight: 300,
              lineHeight: 1
            }}>
              +
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}