export interface Feedback {
  confidence: number;
  clarity: number;
  suggestions: string[];
}

export function generateFeedback(messages: { role: 'user' | 'assistant'; content: string }[]): Feedback {
  const userMessages = messages.filter((m) => m.role === 'user');
  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / Math.max(userMessages.length, 1);
  const hasQuestions = userMessages.some((m) => m.content.includes('?'));
  const wordCount = userMessages.reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);

  // Heuristic-based scores (in real app, use AI to analyze)
  const confidence = Math.min(95, Math.round(50 + avgLength * 0.5 + (hasQuestions ? 15 : 0) + Math.min(wordCount * 2, 20)));
  const clarity = Math.min(95, Math.round(55 + Math.min(avgLength / 2, 25) + (userMessages.length >= 5 ? 10 : 0)));

  const suggestions: string[] = [];
  if (avgLength < 20) suggestions.push('Try elaborating more — add context to your responses.');
  if (!hasQuestions && userMessages.length > 0) suggestions.push('Ask follow-up questions to show engagement.');
  if (wordCount < 30) suggestions.push('Practice giving fuller answers — detail builds connection.');
  if (suggestions.length === 0) suggestions.push('Great job! Keep practicing to build muscle memory.');

  return {
    confidence: Math.max(40, Math.min(95, confidence)),
    clarity: Math.max(45, Math.min(95, clarity)),
    suggestions: suggestions.slice(0, 3),
  };
}
