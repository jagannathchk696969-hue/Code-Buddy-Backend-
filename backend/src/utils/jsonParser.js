/**
 * Safely parses JSON from AI model outputs.
 * Strips markdown code blocks (```json ... ```) and cleans leading/trailing whitespace.
 */
export function safeParseJson(rawText, fallback = null) {
  if (!rawText || typeof rawText !== 'string') {
    return fallback;
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
    cleaned = cleaned.trim();
  }

  // Attempt direct JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    // Attempt to locate first { and last } or first [ and last ]
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const sliced = cleaned.slice(firstBrace, lastBrace + 1);
        return JSON.parse(sliced);
      } catch (sliceErr) {
        // Fallback below
      }
    }

    return fallback;
  }
}
