import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { FEEDBACK_SYSTEM_PROMPT } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const { scenarioName, messages } = await req.json();

    if (!messages?.length) {
      return NextResponse.json({ error: 'Missing messages' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const conversationText = messages
      .map((m: { role: string; content: string }, i: number) => {
        const speaker = m.role === 'user' ? 'User' : 'AI Partner';
        return `${speaker}: "${m.content}"`;
      })
      .join('\n\n');

    const userPrompt = `Scenario: ${scenarioName || 'Social conversation'}

Full conversation (read the full exchange to understand context and how the user responded to different prompts):

${conversationText}

Analyze the USER's messages only, but use the full conversation for context. Score honestly using the rubric. Return the JSON feedback.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: 'No feedback from AI' }, { status: 500 });
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    else {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}') + 1;
      if (start !== -1 && end > start) jsonStr = content.slice(start, end);
    }

    const feedback = JSON.parse(jsonStr) as {
      confidence: number;
      clarity: number;
      professionalism: number;
      suggestions: string[];
    };

    if (
      typeof feedback.confidence !== 'number' ||
      typeof feedback.clarity !== 'number' ||
      typeof feedback.professionalism !== 'number' ||
      !Array.isArray(feedback.suggestions)
    ) {
      return NextResponse.json({ error: 'Invalid feedback format' }, { status: 500 });
    }

    return NextResponse.json({
      confidence: Math.min(100, Math.max(0, feedback.confidence)),
      clarity: Math.min(100, Math.max(0, feedback.clarity)),
      professionalism: Math.min(100, Math.max(0, feedback.professionalism)),
      suggestions: feedback.suggestions.slice(0, 4),
    });
  } catch (err) {
    console.error('Feedback API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
