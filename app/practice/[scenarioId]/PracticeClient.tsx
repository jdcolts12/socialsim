'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getOpener, getResponse } from '@/lib/aiResponses';
import { generateFeedback } from '@/lib/feedback';
import type { ScenarioId } from '@/lib/scenarios';

interface Scenario {
  id: string;
  name: string;
  description: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Feedback {
  confidence: number;
  clarity: number;
  suggestions: string[];
}

const MESSAGES_BEFORE_FEEDBACK = 5;

export default function PracticeClient({ scenario }: { scenario: Scenario }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: getOpener(scenario.id as ScenarioId),
        },
      ]);
    }
  }, [scenario.id, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const userMessageCount = messages.filter((m) => m.role === 'user').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getResponse(scenario.id as ScenarioId, userMessageCount),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);

    if (userMessageCount + 1 >= MESSAGES_BEFORE_FEEDBACK) {
      const msgsForFeedback = [...messages, userMsg, aiMsg];
      setFeedback(
        generateFeedback(
          msgsForFeedback.map((m) => ({ role: m.role, content: m.content }))
        )
      );
    }
  };

  if (feedback) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-2xl font-bold">Your feedback</h1>

          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-6">
              <p className="mb-2 text-sm text-zinc-500">Confidence</p>
              <p className="text-4xl font-bold text-indigo-400">{feedback.confidence}%</p>
            </div>
            <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-6">
              <p className="mb-2 text-sm text-zinc-500">Clarity</p>
              <p className="text-4xl font-bold text-indigo-400">{feedback.clarity}%</p>
            </div>
          </div>

          <div className="mb-10 rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-6">
            <h2 className="mb-4 font-semibold">Suggestions for improvement</h2>
            <ul className="space-y-2">
              {feedback.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-zinc-300">
                  <span className="text-indigo-400">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4">
            <Link
              href={`/practice/${scenario.id}`}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500"
            >
              Try again
            </Link>
            <Link
              href="/scenarios"
              className="rounded-xl border border-zinc-600 px-6 py-3 font-medium transition hover:bg-zinc-800"
            >
              Choose another scenario
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/scenarios" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Back
          </Link>
          <h1 className="font-semibold">{scenario.name}</h1>
          <div className="w-12" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-zinc-800 px-4 py-3">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="border-t border-zinc-800 px-6 py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-zinc-500">
            {userMessageCount} / {MESSAGES_BEFORE_FEEDBACK} messages — feedback after {MESSAGES_BEFORE_FEEDBACK}
          </p>
        </form>
      </footer>
    </main>
  );
}
