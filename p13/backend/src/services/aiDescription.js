const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = 15_000;

export class AiServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'AiServiceError';
    this.status = status;
  }
}

export async function generateTaskDescription(
  title,
  {
    apiKey = process.env.OPENAI_API_KEY,
    fetchImpl = fetch,
    timeoutMs = REQUEST_TIMEOUT_MS,
  } = {}
) {
  if (!apiKey) {
    throw new AiServiceError(
      503,
      'AI suggestions are not configured. You can still add a task manually.'
    );
  }

  try {
    const response = await fetchImpl(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Write one concise, practical task description in 1-3 sentences. Give the user a clear next step. Do not add a title, markdown, or commentary.',
          },
          {
            role: 'user',
            content: `Write a helpful description for this task: ${title}`,
          },
        ],
        max_tokens: 120,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new AiServiceError(
        502,
        'The AI provider could not generate a suggestion. You can still add a task manually.'
      );
    }

    const payload = await response.json();
    const description = payload.choices?.[0]?.message?.content?.trim();
    if (typeof description !== 'string' || description.length === 0) {
      throw new AiServiceError(
        502,
        'The AI provider returned an empty suggestion. You can still add a task manually.'
      );
    }

    return description;
  } catch (error) {
    if (error instanceof AiServiceError) throw error;

    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw new AiServiceError(
        504,
        'The AI request timed out. You can still add a task manually.'
      );
    }

    throw new AiServiceError(
      502,
      'The AI service is temporarily unavailable. You can still add a task manually.'
    );
  }
}
