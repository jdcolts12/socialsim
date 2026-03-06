import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRoleplaySystemPrompt } from '@/lib/prompts';
import type { ScenarioId } from '@/lib/scenarios';

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
    const basePrompt = getRoleplaySystemPrompt(scenarioId as ScenarioId);
    const mappedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // Use only last 6 messages to reduce repetition from copying own style
    const recentMessages = mappedMessages.slice(-6);

    const lastUserMsg = [...recentMessages].reverse().find((m) => m.role === 'user');
    const isRealMessage =
      lastUserMsg?.content &&
      typeof lastUserMsg.content === 'string' &&
      !lastUserMsg.content.includes('[Please start');

    const reminder =
      isRealMessage && lastUserMsg
        ? `\n\nThey just said: "${String(lastUserMsg.content).slice(0, 180)}${String(lastUserMsg.content).length > 180 ? '...' : ''}" — Respond directly to this.`
        : '';

    const responseTypes = [
      'Ask a follow-up question about what they said.',
      'Acknowledge what they said and share your own reaction or experience.',
      'React to a specific detail they mentioned—probe or comment on it.',
      'Build on their point—add your take or push back gently.',
    ];
    const responseType = responseTypes[Math.floor(Math.random() * responseTypes.length)];

    const prevAssistant = recentMessages
      .filter((m: { role: string }) => m.role === 'assistant')
      .map((m: { content: string }) => m.content);
    const antiRepeat =
      prevAssistant.length > 0
        ? `\n\nYour previous replies: ${prevAssistant.map((c: string) => `"${c.slice(0, 60)}..."`).join(' | ')}. Do NOT repeat similar phrasing or structure. Be different this time.`
        : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: basePrompt + reminder + antiRepeat + `\n\nThis time: ${responseType}`,
        },
        ...recentMessages,
      ],
      max_tokens: 350,
      temperature: 0.95,
      frequency_penalty: 1.0,
      presence_penalty: 0.8,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
