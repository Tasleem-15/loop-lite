const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  try {
    console.log('🌱 Starting database seeding for LOOP Lite...');

    // 1. Ensure tables exist
    await db.initDb();

    // 2. Clear existing demo data (optional, clean slate)
    await db.query('DELETE FROM feedback');
    await db.query('DELETE FROM users');

    // 3. Create default demo users
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
    const viewerPasswordHash = await bcrypt.hash('viewer123', saltRounds);

    const adminRes = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Admin Lead', 'admin@loop.com', adminPasswordHash, 'admin']
    );
    const adminId = adminRes.rows[0].id;

    const viewerRes = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Product Viewer', 'viewer@loop.com', viewerPasswordHash, 'viewer']
    );
    const viewerId = viewerRes.rows[0].id;

    console.log('✅ Created users:');
    console.log('   - admin@loop.com (password: admin123) [admin]');
    console.log('   - viewer@loop.com (password: viewer123) [viewer]');

    // 4. Seed realistic customer feedback items
    const sampleFeedback = [
      {
        content: 'The new dashboard is gorgeous and finally fast. Huge improvement.',
        channel: 'App store review',
        sentiment: 'positive',
        sentiment_score: 0.9,
        status: 'actioned',
        created_by: adminId
      },
      {
        content: 'Onboarding took forever — I couldn’t figure out how to invite my team.',
        channel: 'Support ticket',
        sentiment: 'negative',
        sentiment_score: -0.8,
        status: 'new',
        created_by: adminId
      },
      {
        content: 'It does the job, but the mobile experience needs work.',
        channel: 'NPS survey',
        sentiment: 'neutral',
        sentiment_score: 0.0,
        status: 'reviewed',
        created_by: viewerId
      },
      {
        content: 'Billing page keeps timing out when I try to download an invoice.',
        channel: 'Support ticket',
        sentiment: 'negative',
        sentiment_score: -0.75,
        status: 'new',
        created_by: adminId
      },
      {
        content: 'Love the new export feature, saved me an hour today.',
        channel: 'Community post',
        sentiment: 'positive',
        sentiment_score: 0.85,
        status: 'actioned',
        created_by: adminId
      },
      {
        content: 'Prospect wants SSO before they’ll sign — third time this month.',
        channel: 'Sales call note',
        sentiment: 'negative',
        sentiment_score: -0.6,
        status: 'reviewed',
        created_by: adminId
      },
      {
        content: 'Customer support team answered in under 2 minutes and resolved the sync problem. Amazing service!',
        channel: 'Support ticket',
        sentiment: 'positive',
        sentiment_score: 0.95,
        status: 'actioned',
        created_by: adminId
      },
      {
        content: 'Search is responsive, but filtering by custom tags takes an extra click.',
        channel: 'NPS survey',
        sentiment: 'neutral',
        sentiment_score: 0.1,
        status: 'new',
        created_by: viewerId
      },
      {
        content: 'App crashed twice after yesterday’s update when switching projects.',
        channel: 'App store review',
        sentiment: 'negative',
        sentiment_score: -0.9,
        status: 'new',
        created_by: adminId
      },
      {
        content: 'The analytics charts are easy to read and very useful during our weekly standups.',
        channel: 'Community post',
        sentiment: 'positive',
        sentiment_score: 0.8,
        status: 'reviewed',
        created_by: viewerId
      },
      {
        content: 'API documentation is clear, but could use more Node.js and Python code samples.',
        channel: 'Community post',
        sentiment: 'neutral',
        sentiment_score: 0.0,
        status: 'reviewed',
        created_by: adminId
      },
      {
        content: 'Enterprise client loved the speed of sentiment reporting and instant dashboard filters.',
        channel: 'Sales call note',
        sentiment: 'positive',
        sentiment_score: 0.88,
        status: 'actioned',
        created_by: adminId
      }
    ];

    for (const item of sampleFeedback) {
      await db.query(
        `INSERT INTO feedback (content, channel, sentiment, sentiment_score, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.content, item.channel, item.sentiment, item.sentiment_score, item.status, item.created_by]
      );
    }

    console.log(`✅ Seeded ${sampleFeedback.length} realistic feedback records.`);
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
