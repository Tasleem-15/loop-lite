import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AddFeedback({ setActivePage }) {
  const { isAdmin } = useAuth();
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('Support ticket');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const sampleSnippets = [
    {
      text: 'The new dashboard is blazing fast and saves our team hours every day!',
      channel: 'App store review',
      type: 'Positive sample'
    },
    {
      text: 'Export button fails repeatedly with a 504 gateway timeout on large lists.',
      channel: 'Support ticket',
      type: 'Negative sample'
    },
    {
      text: 'The UI looks fine, but can we change the table columns manually?',
      channel: 'NPS survey',
      type: 'Neutral sample'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');
    setSuccessResult(null);

    try {
      const res = await api.addFeedback({ content, channel });
      setSuccessResult(res.feedback);
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setContent(sample.text);
    setChannel(sample.channel);
    setSuccessResult(null);
    setError('');
  };

  if (!isAdmin) {
    return (
      <div className="empty-state">
        <h2>🔒 Restricted Access</h2>
        <p style={{ marginTop: '0.5rem' }}>
          Only users with the <strong>Admin</strong> role can ingest customer feedback.
        </p>
        <button
          className="btn-primary"
          style={{ width: 'auto', marginTop: '1rem' }}
          onClick={() => setActivePage('inbox')}
        >
          Return to Feedback Inbox
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ingest Customer Feedback</h1>
          <p className="page-subtitle">
            Enter verbatim customer comments. The integrated AI will automatically analyze sentiment and tag it.
          </p>
        </div>
      </div>

      <div className="form-card">
        {error && <div className="alert-error">{error}</div>}

        {successResult && (
          <div className="alert-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <CheckCircle2 size={18} />
              <span>Feedback Ingested & Analyzed by AI!</span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              Detected Sentiment:{' '}
              <strong style={{ textTransform: 'uppercase' }}>{successResult.sentiment}</strong>{' '}
              (Score: {successResult.sentiment_score > 0 ? `+${successResult.sentiment_score}` : successResult.sentiment_score})
            </div>
            <button
              type="button"
              onClick={() => setActivePage('inbox')}
              style={{
                marginTop: '0.75rem',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#fff',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>View in Inbox</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Customer Feedback Text</label>
            <textarea
              className="form-textarea"
              required
              placeholder="Paste or type raw customer feedback here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Source Channel</label>
            <select
              className="form-select"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="Support ticket">Support ticket</option>
              <option value="App store review">App store review</option>
              <option value="NPS survey">NPS survey</option>
              <option value="Sales call note">Sales call note</option>
              <option value="Community post">Community post</option>
              <option value="Direct Web">Direct Web</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            <Sparkles size={18} />
            <span>{loading ? 'AI is Analyzing & Ingesting...' : 'Submit & Classify with AI'}</span>
          </button>
        </form>

        {/* Quick Sample Presets */}
        <div className="quick-samples">
          <div className="quick-samples-title">⚡ Quick Test Presets (Click to autofill)</div>
          <div className="quick-sample-chips">
            {sampleSnippets.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => loadSample(s)}
              >
                <strong style={{ color: '#60a5fa' }}>{s.type}:</strong> "{s.text}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
