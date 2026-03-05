import type { ScenarioId } from './scenarios';

const OPENERS: Record<ScenarioId, string> = {
  'job-interview': "Hi, thanks for coming in. I'm Sarah, the hiring manager. Tell me about yourself.",
  'talking-to-boss': "Hey, do you have a minute? I wanted to talk about the project timeline.",
  'first-date': "Hi! I'm so glad we could finally meet. I've been looking forward to this.",
  'networking-event': "Hi there! I don't think we've met. I'm Mike from the marketing team.",
  'sales-pitch': "Thanks for taking the time to meet. I've looked at your needs — let me share how we can help.",
};

const RESPONSE_TEMPLATES: Record<ScenarioId, string[]> = {
  'job-interview': [
    "That's interesting. What would you say is your biggest strength?",
    "I see. And how do you handle conflict with colleagues?",
    "Good point. Where do you see yourself in five years?",
    "Thanks for sharing. Do you have any questions for us?",
    "We'll be in touch. Thanks for your time today.",
  ],
  'talking-to-boss': [
    "I understand. The deadline is tight, but we need to prioritize quality.",
    "Let me think about that. Can you send me a summary of your concerns?",
    "I appreciate you bringing this up. Let's find a middle ground.",
    "That makes sense. I'll discuss with the team and get back to you.",
    "Thanks for the conversation. I'll follow up by end of week.",
  ],
  'first-date': [
    "I love that! So what do you like to do for fun?",
    "That's cool. I'm really into trying new restaurants too.",
    "Ha, same! What got you into that?",
    "I've had a great time. Would you want to do this again sometime?",
    "This was really nice. I'll text you!",
  ],
  'networking-event': [
    "Nice to meet you too! What brings you here tonight?",
    "That sounds fascinating. How long have you been in that role?",
    "We should connect on LinkedIn. What's the best way to reach you?",
    "I'd love to hear more about that project. Coffee sometime?",
    "Great chatting! Let's stay in touch.",
  ],
  'sales-pitch': [
    "Interesting. What's your biggest concern with your current solution?",
    "I hear you. Let me show you how we've helped similar companies.",
    "That's a valid point. Our pricing is flexible — let me break it down.",
    "Would a demo help? I can set one up for this week.",
    "Thanks for your time. I'll send a proposal by tomorrow.",
  ],
};

export function getOpener(scenarioId: ScenarioId): string {
  return OPENERS[scenarioId];
}

export function getResponse(scenarioId: ScenarioId, messageIndex: number): string {
  const templates = RESPONSE_TEMPLATES[scenarioId];
  return templates[Math.min(messageIndex, templates.length - 1)];
}
