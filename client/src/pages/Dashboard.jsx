import React, { useEffect, useState } from 'react';
import { api } from '../api';
import StatCard from '../components/StatCard';
import { SentimentPieChart, ChannelBarChart } from '../components/SentimentChart';
import { MessageSquare, ThumbsUp, ThumbsDown, HelpCircle, Bell, ArrowRight } from 'lucide-react';

export default function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="empty-state">Loading dashboard analytics...</div>;
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  const { summary = {}, sentimentChartData = [], channelBreakdown = [] } = stats || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time overview of customer sentiment, volume, and channel intelligence</p>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto' }}
          onClick={() => setActivePage('inbox')}
        >
          <span>View All Feedback</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Ingested"
          value={summary.total || 0}
          subtext={`${summary.newCount || 0} awaiting review`}
          icon={<MessageSquare size={22} color="#60a5fa" />}
        />
        <StatCard
          label="Positive Sentiment"
          value={`${summary.positivePct || 0}%`}
          subtext={`${summary.positive || 0} customer comments`}
          icon={<ThumbsUp size={22} color="#34d399" />}
          valueColor="#34d399"
        />
        <StatCard
          label="Neutral Sentiment"
          value={`${summary.neutralPct || 0}%`}
          subtext={`${summary.neutral || 0} customer comments`}
          icon={<HelpCircle size={22} color="#fbbf24" />}
          valueColor="#fbbf24"
        />
        <StatCard
          label="Negative Sentiment"
          value={`${summary.negativePct || 0}%`}
          subtext={`${summary.negative || 0} complaints / blockers`}
          icon={<ThumbsDown size={22} color="#f87171" />}
          valueColor="#f87171"
        />
      </div>

      {/* Visual Analytics */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">
            <span>Sentiment Distribution</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>AI Tagged</span>
          </div>
          <SentimentPieChart data={sentimentChartData} />
        </div>

        <div className="chart-card">
          <div className="chart-title">
            <span>Feedback by Source Channel</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Distribution</span>
          </div>
          <ChannelBarChart data={channelBreakdown} />
        </div>
      </div>
    </div>
  );
}
