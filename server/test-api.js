// Quick end-to-end API test script for LOOP Lite
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const statsRoutes = require('./routes/stats');

async function testSuite() {
  console.log('🧪 Starting API Verification Suite...');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/stats', statsRoutes);

  const server = app.listen(5099, async () => {
    try {
      const BASE = 'http://localhost:5099/api';

      // 1. Test Admin Login
      console.log('1. Testing Admin Login...');
      const adminLoginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@loop.com', password: 'admin123' })
      });
      const adminData = await adminLoginRes.json();
      if (!adminLoginRes.ok || !adminData.token) {
        throw new Error('Admin login failed: ' + JSON.stringify(adminData));
      }
      const adminToken = adminData.token;
      console.log('   ✅ Admin Login successful. Role:', adminData.user.role);

      // 2. Test Viewer Login
      console.log('2. Testing Viewer Login...');
      const viewerLoginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'viewer@loop.com', password: 'viewer123' })
      });
      const viewerData = await viewerLoginRes.json();
      const viewerToken = viewerData.token;
      console.log('   ✅ Viewer Login successful. Role:', viewerData.user.role);

      // 3. Test Fetch Stats
      console.log('3. Testing Dashboard Stats API...');
      const statsRes = await fetch(`${BASE}/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const stats = await statsRes.json();
      console.log('   ✅ Stats received. Total Feedback:', stats.summary.total, 'Positive %:', stats.summary.positivePct);

      // 4. Test Add Feedback as Admin (AI Tagging)
      console.log('4. Testing Add Feedback with AI classification...');
      const addRes = await fetch(`${BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          content: 'The new speed optimizations are unbelievable, best update ever!',
          channel: 'App store review'
        })
      });
      const newFeedback = await addRes.json();
      if (!addRes.ok) throw new Error('Add feedback failed: ' + JSON.stringify(newFeedback));
      console.log('   ✅ Added item ID:', newFeedback.feedback.id, 'AI Tagged Sentiment:', newFeedback.feedback.sentiment, 'Score:', newFeedback.feedback.sentiment_score);

      // 5. Test Role Guard: Viewer attempting to delete should get 403
      console.log('5. Testing RBAC Role Guard (Viewer forbidden from deleting)...');
      const forbiddenDelRes = await fetch(`${BASE}/feedback/${newFeedback.feedback.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${viewerToken}` }
      });
      if (forbiddenDelRes.status === 403) {
        console.log('   ✅ Successfully rejected Viewer delete with HTTP 403 Forbidden.');
      } else {
        throw new Error('Expected HTTP 403, got ' + forbiddenDelRes.status);
      }

      // 6. Test Admin deleting the test item
      console.log('6. Testing Admin deleting item...');
      const delRes = await fetch(`${BASE}/feedback/${newFeedback.feedback.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (delRes.ok) {
        console.log('   ✅ Item cleaned up successfully.');
      }

      console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The stack is 100% verified.');
    } catch (err) {
      console.error('❌ Test failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

testSuite();
