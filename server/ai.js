require('dotenv').config();

/**
 * Heuristic fallback classifier if Gemini API key is missing or network fails
 */
function fallbackClassifySentiment(text) {
  const lower = text.toLowerCase();
  
  const positiveKeywords = [
    'great', 'love', 'gorgeous', 'fast', 'improvement', 'saved', 'awesome', 'good', 
    'amazing', 'perfect', 'excellent', 'helpful', 'happy', 'pleased', 'fantastic', 'easy', 'best'
  ];
  
  const negativeKeywords = [
    'took forever', 'broken', 'timeout', 'timing out', 'crash', 'crashing', 'fail', 'failed',
    'slow', 'horrible', 'terrible', 'bad', 'poor', 'hate', 'bug', 'error', 'couldn\'t', 
    'cannot', 'frustrated', 'annoying', 'worst'
  ];

  let posCount = 0;
  let negCount = 0;

  positiveKeywords.forEach(word => {
    if (lower.includes(word)) posCount++;
  });

  negativeKeywords.forEach(word => {
    if (lower.includes(word)) negCount++;
  });

  if (posCount > negCount) {
    const score = Math.min(0.9, 0.4 + posCount * 0.2);
    return { sentiment: 'positive', sentiment_score: parseFloat(score.toFixed(2)) };
  } else if (negCount > posCount) {
    const score = Math.max(-0.9, -0.4 - negCount * 0.2);
    return { sentiment: 'negative', sentiment_score: parseFloat(score.toFixed(2)) };
  } else {
    return { sentiment: 'neutral', sentiment_score: 0.0 };
  }
}

/**
 * Classifies feedback sentiment using Google Gemini API or intelligent fallback
 * @param {string} content 
 * @returns {Promise<{ sentiment: string, sentiment_score: number }>}
 */
async function classifySentiment(content) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Graceful fallback to heuristic classification
    return fallbackClassifySentiment(content);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an AI customer feedback sentiment analyzer.
Analyze the following customer feedback text.
Return ONLY a valid JSON object (no markdown, no quotes around the JSON, no backticks) with exactly two fields:
1. "sentiment": one of "positive", "neutral", or "negative"
2. "sentiment_score": a float between -1.0 (extremely negative) and 1.0 (extremely positive)

Customer feedback:
"${content}"`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Using fallback classifier.`);
      return fallbackClassifySentiment(content);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return fallbackClassifySentiment(content);
    }

    // Clean JSON text if there are code fences
    const cleanedText = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    const sentiment = ['positive', 'neutral', 'negative'].includes(parsed.sentiment?.toLowerCase())
      ? parsed.sentiment.toLowerCase()
      : 'neutral';
    
    let score = parseFloat(parsed.sentiment_score);
    if (isNaN(score)) score = sentiment === 'positive' ? 0.7 : sentiment === 'negative' ? -0.7 : 0.0;
    score = Math.max(-1.0, Math.min(1.0, score));

    return {
      sentiment,
      sentiment_score: parseFloat(score.toFixed(2))
    };
  } catch (err) {
    console.error('Error invoking Gemini API:', err.message);
    return fallbackClassifySentiment(content);
  }
}

module.exports = {
  classifySentiment
};
