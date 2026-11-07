const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/stats
 * Aggregates feedback metrics for dashboard stat cards and charts
 * Access: Logged-in users
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // 1. Overall counts and sentiment breakdown
    const overallQuery = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN LOWER(sentiment) = 'positive' THEN 1 END)::int AS positive,
        COUNT(CASE WHEN LOWER(sentiment) = 'neutral' THEN 1 END)::int AS neutral,
        COUNT(CASE WHEN LOWER(sentiment) = 'negative' THEN 1 END)::int AS negative,
        COUNT(CASE WHEN LOWER(status) = 'new' THEN 1 END)::int AS new_count,
        COUNT(CASE WHEN LOWER(status) = 'reviewed' THEN 1 END)::int AS reviewed_count,
        COUNT(CASE WHEN LOWER(status) = 'actioned' THEN 1 END)::int AS actioned_count
      FROM feedback
    `;
    const overallRes = await db.query(overallQuery);
    const counts = overallRes.rows[0] || {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      new_count: 0,
      reviewed_count: 0,
      actioned_count: 0
    };

    // Calculate percentages
    const total = counts.total || 0;
    const positivePct = total > 0 ? Math.round((counts.positive / total) * 100) : 0;
    const neutralPct = total > 0 ? Math.round((counts.neutral / total) * 100) : 0;
    const negativePct = total > 0 ? Math.round((counts.negative / total) * 100) : 0;

    // 2. Channel breakdown
    const channelQuery = `
      SELECT channel, COUNT(*)::int AS count
      FROM feedback
      GROUP BY channel
      ORDER BY count DESC
    `;
    const channelRes = await db.query(channelQuery);

    // 3. Recharts-friendly sentiment distribution array
    const sentimentChartData = [
      { name: 'Positive', count: counts.positive, fill: '#10B981' }, // emerald
      { name: 'Neutral', count: counts.neutral, fill: '#F59E0B' },  // amber
      { name: 'Negative', count: counts.negative, fill: '#EF4444' }  // rose
    ];

    res.json({
      summary: {
        total,
        positive: counts.positive,
        neutral: counts.neutral,
        negative: counts.negative,
        positivePct,
        neutralPct,
        negativePct,
        newCount: counts.new_count,
        reviewedCount: counts.reviewed_count,
        actionedCount: counts.actioned_count
      },
      sentimentChartData,
      channelBreakdown: channelRes.rows
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve stats: ' + error.message });
  }
});

module.exports = router;
