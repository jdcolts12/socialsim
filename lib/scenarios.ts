export const SCENARIOS = [
  { id: 'job-interview', name: 'Job Interview', description: 'Practice answering interview questions' },
  { id: 'talking-to-boss', name: 'Talking to Boss', description: 'Handle difficult workplace conversations' },
  { id: 'first-date', name: 'First Date', description: 'Build confidence in dating conversations' },
  { id: 'networking-event', name: 'Networking Event', description: 'Make connections and small talk' },
  { id: 'sales-pitch', name: 'Sales Pitch', description: 'Present and persuade effectively' },
] as const;

export type ScenarioId = (typeof SCENARIOS)[number]['id'];
