/**
 * Practical 13: AI API Integration into a Web Application
 * Controller: Handles AI Description Generation, Rate Limiting & Graceful Degradation
 */

// In-memory rate limiting store (maps IP/client to last request timestamp)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 3000; // 3 seconds per client to prevent spam

/**
 * Heuristic Contextual Generator for Graceful Degradation
 * When external AI is unreachable or API key is absent, this provides
 * a sensible editable template so the user is never blocked.
 */
function generateContextualFallback(title) {
  const lower = (title || '').toLowerCase();
  let priority = 'Medium';
  let hours = '4 hours';
  let checklist = [];

  if (lower.includes('auth') || lower.includes('login') || lower.includes('jwt') || lower.includes('security')) {
    priority = 'High';
    hours = '6 hours';
    checklist = [
      'Design secure schema and password hashing using bcrypt',
      'Implement JWT token generation and verification middleware',
      'Test edge cases: expired tokens, invalid signatures, missing headers'
    ];
  } else if (lower.includes('docker') || lower.includes('compose') || lower.includes('container') || lower.includes('deploy')) {
    priority = 'High';
    hours = '5 hours';
    checklist = [
      'Write multi-stage Dockerfile optimizing image layer cache',
      'Define docker-compose.yml networking and volume persistence',
      'Validate container startup and inter-service health checks'
    ];
  } else if (lower.includes('ci') || lower.includes('cd') || lower.includes('github') || lower.includes('test') || lower.includes('pipeline')) {
    priority = 'Medium';
    hours = '3 hours';
    checklist = [
      'Configure automated workflow in .github/workflows/',
      'Setup automated unit and integration test execution',
      'Verify build triggers on push and pull-request events'
    ];
  } else if (lower.includes('cache') || lower.includes('redis') || lower.includes('perf') || lower.includes('optimiz')) {
    priority = 'Medium';
    hours = '4 hours';
    checklist = [
      'Implement TTL-based in-memory cache layer for frequent queries',
      'Configure cache invalidation on mutations (POST/PUT/DELETE)',
      'Benchmark response latency before and after caching'
    ];
  } else {
    checklist = [
      'Break down requirements into measurable sub-deliverables',
      'Implement core functionality and error handling',
      'Document API endpoints and conduct manual/automated verification'
    ];
  }

  const description = `This task involves completing '${title}'. Key objectives include:\n` +
    checklist.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n') +
    `\n\nDeliverable: Fully tested, robust implementation adhering to project coding standards.`;

  return { description, priority, hours };
}

/**
 * Call Google Gemini API
 */
async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return text.trim();
}

/**
 * Call OpenAI API
 */
async function callOpenAI(apiKey, prompt) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an agile software engineering assistant. Generate concise, actionable task descriptions (2-4 sentences with 2-3 bulleted action items).'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI API');
  return text.trim();
}

/**
 * @desc    Generate AI Task Description with Graceful Degradation
 * @route   POST /api/ai/generate-description
 */
exports.generateDescription = async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Task title is required to generate description.'
    });
  }

  // Rate Limiting check
  const clientIp = req.ip || req.connection.remoteAddress || 'client';
  const now = Date.now();
  const lastRequest = rateLimitMap.get(clientIp);

  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequest)) / 1000);
    return res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Please wait ${waitSec}s before requesting AI assistance again.`
    });
  }
  rateLimitMap.set(clientIp, now);

  const prompt = `Write a short, professional, and actionable task description for a task titled: "${title.trim()}". Include 3 concise action bullet points and a suggested priority (Low/Medium/High/Urgent).`;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    let aiText = '';
    let usedProvider = '';

    if (geminiKey && geminiKey.trim()) {
      usedProvider = 'Google Gemini API (gemini-1.5-flash)';
      aiText = await callGemini(geminiKey.trim(), prompt);
    } else if (openaiKey && openaiKey.trim()) {
      usedProvider = 'OpenAI API (gpt-4o-mini)';
      aiText = await callOpenAI(openaiKey.trim(), prompt);
    } else {
      // Intentional local fallback when no API key is configured
      throw new Error('NO_API_KEY_CONFIGURED');
    }

    return res.status(200).json({
      success: true,
      title: title.trim(),
      description: aiText,
      source: usedProvider,
      fallback: false,
      disclaimer: '⚠️ AI-generated suggestion: Please review, verify, and customize before saving.',
      generatedAt: new Date().toISOString()
    });

  } catch (err) {
    // GRACEFUL DEGRADATION: Catch error, log safely without exposing keys, return fallback
    const isNoKey = err.message === 'NO_API_KEY_CONFIGURED';
    console.warn(`[Graceful Degradation Triggered] Reason: ${isNoKey ? 'No external API key provided' : err.message}`);

    const fallbackData = generateContextualFallback(title);

    return res.status(200).json({
      success: true,
      title: title.trim(),
      description: fallbackData.description,
      suggestedPriority: fallbackData.priority,
      estimatedHours: fallbackData.hours,
      source: 'Graceful Degradation Fallback Engine',
      fallback: true,
      fallbackReason: isNoKey 
        ? 'External API key not configured; serving contextual intelligent template.' 
        : 'External AI service temporarily unavailable; server provided safe fallback.',
      disclaimer: '⚠️ Fallback suggestion: Generated locally without third-party exposure.',
      generatedAt: new Date().toISOString()
    });
  }
};

/**
 * @desc    Simulate Deliberate Failure to demonstrate live Graceful Degradation
 * @route   POST /api/ai/test-failure
 */
exports.testFailurePath = async (req, res) => {
  const { title = 'Deploy Microservice to Production Cluster' } = req.body;
  console.log(`[Testing Failure Path] Simulating 401 Unauthorized API error for title: "${title}"...`);

  // Force an error simulation to demonstrate try-catch and graceful recovery
  try {
    throw new Error('401 Unauthorized: Invalid or revoked API key simulation');
  } catch (err) {
    const fallbackData = generateContextualFallback(title);

    return res.status(200).json({
      success: true,
      title,
      description: fallbackData.description,
      suggestedPriority: fallbackData.priority,
      estimatedHours: fallbackData.hours,
      source: 'Graceful Degradation Fallback (Simulation Mode)',
      fallback: true,
      simulatedError: err.message,
      status: 'App handled error gracefully; zero crashes, service remains fully operational.',
      disclaimer: '⚠️ Graceful degradation verified: Core app functionality remains 100% active.',
      timestamp: new Date().toISOString()
    });
  }
};
