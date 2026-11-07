import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, CheckCircle2, Clock, ThumbsUp, ThumbsDown, Minus, RefreshCw } from 'lucide-react';

export default function FeedbackList() {
  const { isAdmin } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFeedback();
  }, [sentimentFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeedback();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await api.getFeedback({
        search,
        sentiment: sentimentFilter,
        status: statusFilter
      });
      setFeedback(data.feedback || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch feedback list');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateFeedbackStatus(id, newStatus);
      setFeedback(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback item?')) return;
    try {
      await api.deleteFeedback(id);
      setFeedback(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  const renderSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <ThumbsUp size={13} />;
      case 'negative':
        return <ThumbsDown size={13} />;
      default:
        return <Minus size={13} />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback Inbox</h1>
          <p className="page-subtitle">
            Browse, search, and action customer responses tagged with AI sentiment
          </p>
        </div>
        <button
          className="filter-btn"
          onClick={fetchFeedback}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Search and Filters Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search keywords (e.g. crash, fast, billing)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={16} className="search-icon" />
        </div>

        {/* Sentiment Filter Pills */}
        <div className="filter-group">
          {['all', 'positive', 'neutral', 'negative'].map((sent) => (
            <button
              key={sent}
              className={`filter-btn ${sentimentFilter === sent ? 'active' : ''}`}
              onClick={() => setSentimentFilter(sent)}
              style={{ textTransform: 'capitalize' }}
            >
              {sent}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          {['all', 'new', 'reviewed', 'actioned'].map((st) => (
            <button
              key={st}
              className={`filter-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
              style={{ textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Items List */}
      {loading ? (
        <div className="empty-state">Loading feedback items...</div>
      ) : feedback.length === 0 ? (
        <div className="empty-state">
          No customer feedback matching the selected filters.
        </div>
      ) : (
        <div className="feedback-card-list">
          {feedback.map((item) => (
            <div key={item.id} className="feedback-card">
              <div className="feedback-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="channel-tag">{item.channel || 'Direct'}</span>
                  <span className={`status-badge ${item.status || 'new'}`}>
                    {item.status || 'new'}
                  </span>
                </div>

                <div className={`sentiment-badge ${item.sentiment || 'neutral'}`}>
                  {renderSentimentIcon(item.sentiment)}
                  <span>{item.sentiment}</span>
                  {item.sentiment_score !== null && (
                    <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>
                      ({item.sentiment_score > 0 ? `+${item.sentiment_score}` : item.sentiment_score})
                    </span>
                  )}
                </div>
              </div>

              <div className="feedback-text">{item.content}</div>

              <div className="feedback-card-footer">
                <div>
                  Added by <strong style={{ color: '#cbd5e1' }}>{item.author_name || 'System'}</strong> on{' '}
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>

                {isAdmin ? (
                  <div className="feedback-actions">
                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Status:</label>
                    <select
                      className="status-select"
                      value={item.status || 'new'}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="actioned">Actioned</option>
                    </select>

                    <button
                      className="btn-icon-danger"
                      onClick={() => handleDelete(item.id)}
                      title="Delete feedback"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                    Read-only (Viewer role)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
