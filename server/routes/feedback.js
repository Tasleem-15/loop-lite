const express = require('express');
const router = express.Router();
const db = require('../db');
const { classifySentiment } = require('../ai');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * GET /api/feedback
 * List feedback with optional search and sentiment filtering
 * Access: Logged-in users (both Admin and Viewer)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, sentiment, status } = req.query;

    let queryText = `
      SELECT f.id, f.content, f.channel, f.sentiment, f.sentiment_score, 
             f.status, f.created_at, f.created_by, u.name AS author_name, u.email AS author_email
      FROM feedback f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by search query (case-insensitive)
    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      queryText += ` AND f.content ILIKE $${params.length}`;
    }

    // Filter by sentiment (positive, neutral, negative)
    if (sentiment && sentiment.trim() !== '' && sentiment.toLowerCase() !== 'all') {
      params.push(sentiment.trim().toLowerCase());
      queryText += ` AND LOWER(f.sentiment) = $${params.length}`;
    }

    // Filter by status (new, reviewed, actioned)
    if (status && status.trim() !== '' && status.toLowerCase() !== 'all') {
      params.push(status.trim().toLowerCase());
      queryText += ` AND LOWER(f.status) = $${params.length}`;
    }

    queryText += ` ORDER BY f.created_at DESC`;

    const result = await db.query(queryText, params);
    res.json({ feedback: result.rows });
  } catch (error) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback: ' + error.message });
  }
});

/**
 * POST /api/feedback
 * Add feedback item. Calls AI to automatically tag sentiment and score.
 * Access: Admin only
 */
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { content, channel } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Feedback content is required' });
    }

    const selectedChannel = channel && channel.trim() !== '' ? channel.trim() : 'Direct Web';

    // 1. AI Analysis
    const aiResult = await classifySentiment(content.trim());
    const sentiment = aiResult.sentiment;
    const sentimentScore = aiResult.sentiment_score;

    // 2. Insert into PostgreSQL
    const insertQuery = `
      INSERT INTO feedback (content, channel, sentiment, sentiment_score, status, created_by)
      VALUES ($1, $2, $3, $4, 'new', $5)
      RETURNING id, content, channel, sentiment, sentiment_score, status, created_at, created_by
    `;
    const result = await db.query(insertQuery, [
      content.trim(),
      selectedChannel,
      sentiment,
      sentimentScore,
      req.user.id
    ]);

    const createdFeedback = result.rows[0];
    createdFeedback.author_name = req.user.name;

    res.status(201).json({
      message: 'Feedback submitted and tagged by AI successfully',
      feedback: createdFeedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback: ' + error.message });
  }
});

/**
 * PATCH /api/feedback/:id/status
 * Update status of a feedback item (new -> reviewed -> actioned)
 * Access: Admin only
 */
router.patch('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'reviewed', 'actioned'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: 'Status must be one of: new, reviewed, actioned' });
    }

    const updateQuery = `
      UPDATE feedback
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(updateQuery, [status.toLowerCase(), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    res.json({
      message: 'Status updated successfully',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status: ' + error.message });
  }
});

/**
 * DELETE /api/feedback/:id
 * Delete a feedback item
 * Access: Admin only
 */
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM feedback WHERE id = $1 RETURNING id';
    const result = await db.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    res.json({ message: 'Feedback item deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Failed to delete feedback: ' + error.message });
  }
});

module.exports = router;
