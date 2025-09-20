export interface FormattedResponse {
  content: string;
  highlights: Array<{
    type: 'important' | 'benefit' | 'warning' | 'action';
    text: string;
  }>;
}

export function parseGeminiResponse(rawResponse: string): FormattedResponse {
  const highlights: FormattedResponse['highlights'] = [];
  let content = rawResponse;

  // Extract and format different types of highlights
  const patterns = [
    { type: 'important' as const, regex: /\[IMPORTANT\](.*?)(?=\[|$)/g, color: 'blue' },
    { type: 'benefit' as const, regex: /\[BENEFIT\](.*?)(?=\[|$)/g, color: 'green' },
    { type: 'warning' as const, regex: /\[WARNING\](.*?)(?=\[|$)/g, color: 'red' },
    { type: 'action' as const, regex: /\[ACTION\](.*?)(?=\[|$)/g, color: 'purple' }
  ];

  patterns.forEach(({ type, regex }) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const text = match[1].trim();
      if (text) {
        highlights.push({ type, text });
      }
    }
  });

  // Clean up the content by removing the tags
  content = content
    .replace(/\[IMPORTANT\]/g, '')
    .replace(/\[BENEFIT\]/g, '')
    .replace(/\[WARNING\]/g, '')
    .replace(/\[ACTION\]/g, '')
    .trim();

  return { content, highlights };
}