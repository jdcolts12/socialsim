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
    const mappedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const lastUserMsg = [...mappedMessages].reverse().find((m) => m.role === 'user');
    const isRealMessage =
      lastUserMsg?.content &&
      typeof lastUserMsg.content === 'string' &&
      !lastUserMsg.content.includes('[Please start');

    let messagesToSend = mappedMessages;

    if (isRealMessage && lastUserMsg) {
      const theirWords = String(lastUserMsg.content).trim();
      const lastIdx = mappedMessages.length - 1;
      messagesToSend = [...mappedMessages];
      messagesToSend[lastIdx] = {
        ...lastUserMsg,
        content: `They said: "${theirWords}"\n\nRespond directly to this. Reference their words. Do not give a generic reply.`,
      };
    }

    const systemPrompt = getRoleplaySystemPrompt(scenarioId as ScenarioId);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesToSend,
      ],
      max_tokens: 400,
      temperature: 1.2,
      frequency_penalty: 1.5,
      presence_penalty: 1.0,
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
