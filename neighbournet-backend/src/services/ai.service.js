const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

/**
 * Analyzes a post's title/content and returns:
 * - suggestedCategory: one of our category enum values
 * - confidence: 0-1 float
 * - spamScore: 0-100 integer
 * - isSpam: boolean (true if spamScore is high)
 */
const categorizeAndScorePost = async (title, content) => {
  const prompt = `You are a content moderation and categorization assistant for a hyperlocal community app in India.

Given a post's title and content, respond with ONLY a JSON object (no markdown, no explanation) in this exact shape:
{
  "suggestedCategory": "civic" | "recommendation" | "alert" | "lostfound" | "buysell" | "service",
  "confidence": <float between 0 and 1>,
  "spamScore": <integer between 0 and 100, where 100 is definitely spam>,
  "reasoning": "<one short sentence>"
}

Category definitions:
- civic: infrastructure/government issues (potholes, water logging, power cuts)
- recommendation: suggesting a local business/service (doctor, restaurant, tiffin service)
- alert: urgent safety/hazard warning (flooding, crime, road blocks)
- lostfound: lost or found items/pets
- buysell: selling or buying an item
- service: requesting a service from the community

Post title: "${title}"
Post content: "${content}"`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the JSON in ```json ... ```
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      suggestedCategory: parsed.suggestedCategory || null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      spamScore: typeof parsed.spamScore === 'number' ? parsed.spamScore : 0,
      isSpam: (parsed.spamScore || 0) >= 70,
      reasoning: parsed.reasoning || '',
    };
  } catch (err) {
    console.error('AI categorization error:', err.message);
    return {
      suggestedCategory: null,
      confidence: 0,
      spamScore: 0,
      isSpam: false,
      reasoning: 'AI analysis unavailable',
    };
  }
};

/**
 * Generates a structured daily digest summarizing a locality's last 24h of posts.
 */
const generateLocalityDigest = async (locality, posts) => {
  if (!posts || posts.length === 0) {
    return {
      summary: `No new activity in ${locality} in the last 24 hours.`,
      topIssues: [],
      topRecommendations: [],
      resolvedCount: 0,
      trendingTopics: [],
    };
  }

  // Keep the prompt light — just title, category, status per post, not full content
  const postsSummary = posts
    .map((p) => `- [${p.category}] "${p.title}" (status: ${p.status})`)
    .join('\n');

  const prompt = `You are summarizing 24 hours of community activity for the "${locality}" neighborhood in India.

Here are today's posts:
${postsSummary}

Respond with ONLY a JSON object (no markdown, no explanation) in this exact shape:
{
  "summary": "<2-3 sentence overview of today's activity in this locality>",
  "topIssues": ["<short phrase>", ...up to 3],
  "topRecommendations": ["<short phrase>", ...up to 3],
  "resolvedCount": <integer, count of posts with status "resolved">,
  "trendingTopics": ["<short phrase>", ...up to 3]
}`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || 'No summary available.',
      topIssues: parsed.topIssues || [],
      topRecommendations: parsed.topRecommendations || [],
      resolvedCount: typeof parsed.resolvedCount === 'number' ? parsed.resolvedCount : 0,
      trendingTopics: parsed.trendingTopics || [],
    };
  } catch (err) {
    console.error('AI digest generation error:', err.message);
    return {
      summary: `${posts.length} post(s) today in ${locality}. AI summary unavailable.`,
      topIssues: [],
      topRecommendations: [],
      resolvedCount: posts.filter((p) => p.status === 'resolved').length,
      trendingTopics: [],
    };
  }
};

module.exports = { categorizeAndScorePost, generateLocalityDigest };