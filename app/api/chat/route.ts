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
    const systemPrompt = getRoleplaySystemPrompt(scenarioId as ScenarioId);
    const mappedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // Replace last user message with instruction-wrapped version so the model MUST respond to it
    const lastIdx = mappedMessages.length - 1;
    const lastMsg = mappedMessages[lastIdx];
    const isRealUserMessage =
      lastMsg?.role === 'user' &&
      lastMsg?.content &&
      !lastMsg.content.includes('[Please start');

    if (isRealUserMessage && lastMsg) {
      const theirWords = (lastMsg.content as string).trim();
      mappedMessages[lastIdx] = {
        ...lastMsg,
        content: `[What they said — respond directly to this. Reference their specific words.]\n\n${theirWords}`,
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...mappedMessages,
      ],
      max_tokens: 300,
      temperature: 0.9,
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
