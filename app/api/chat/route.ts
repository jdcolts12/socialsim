import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { getRoleplaySystemPrompt } from '@/lib/prompts';
import type { ScenarioId } from '@/lib/scenarios';

const VIBES = [
  'You\'re feeling a bit tired but engaged.',
  'You\'re in a good mood.',
  'You\'re direct and to-the-point.',
  'You\'re warm and curious.',
  'You\'re slightly skeptical.',
  'You\'re enthusiastic.',
  'You\'re thoughtful and measured.',
  'You\'re casual and relaxed.',
];

export async function POST(req: NextRequest) {
  try {
    const { scenarioId, messages } = await req.json();

    if (!scenarioId || !messages?.length) {
      return NextResponse.json({ error: 'Missing scenarioId or messages' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    const isRealMessage =
      lastUserMsg?.content &&
      typeof lastUserMsg.content === 'string' &&
      !lastUserMsg.content.includes('[Please start');

    if (!isRealMessage || !lastUserMsg) {
      const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: getRoleplaySystemPrompt(scenarioId as ScenarioId) },
        { role: 'user', content: 'Start the conversation. Say your first line.' },
      ],
        max_tokens: 200,
        temperature: 1.0,
        frequency_penalty: 0.8,
        presence_penalty: 0.5,
      });
      const content = completion.choices[0]?.message?.content?.trim();
      return NextResponse.json(
        { content: content || "Hi there. Tell me about yourself." },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const theirWords = String(lastUserMsg.content).trim();

    const transcript = messages
      .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
      .filter((m: { content: string }) => !m.content.includes('[Please start'))
      .map((m: { role: string; content: string }, i: number) => {
        const speaker = m.role === 'user' ? 'Them' : 'You';
        return `${speaker}: ${m.content}`;
      })
      .join('\n');

    const vibe = VIBES[Math.floor(Math.random() * VIBES.length)];
    const basePrompt = getRoleplaySystemPrompt(scenarioId as ScenarioId);

    const uniqueId = Math.random().toString(36).slice(2, 10);
    const userPrompt = `[${uniqueId}] Conversation so far:
${transcript}

They just said: "${theirWords}"

${vibe} Respond to what they said. Reference their words. Be specific. Do NOT say "That's interesting" or "Great."`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: basePrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 400,
      temperature: 1.3,
      frequency_penalty: 1.5,
      presence_penalty: 1.0,
      seed: Math.floor(Math.random() * 2147483647),
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    return NextResponse.json(
      { content },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
