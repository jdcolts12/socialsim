'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { generateFeedback } from '@/lib/feedback';
import { useVoiceInput } from '@/lib/useVoiceInput';
import { useVoiceOutput } from '@/lib/useVoiceOutput';
import type { ScenarioId } from '@/lib/scenarios';

function MicIcon({ isListening }: { isListening: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={isListening ? 'text-red-500' : ''}
    >
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function SpeakerIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? 'text-[var(--accent)]' : ''}
    >
      <path d="M11 5L6 9H2v6h4l5 4V5Z" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

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
  professionalism?: number;
  suggestions: string[];
}

const MESSAGES_BEFORE_FEEDBACK = 5;

async function fetchAIResponse(scenarioId: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(`/api/chat?t=${Date.now()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId, messages }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get AI response');
  return data.content;
}

async function fetchFeedback(
  scenarioName: string,
  messages: { role: string; content: string }[]
): Promise<Feedback> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioName, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get feedback');
  return data;
}

export default function PracticeClient({ scenario }: { scenario: Scenario }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [useOpenAI, setUseOpenAI] = useState<boolean | null>(null);
  const [voiceOutput, setVoiceOutput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  const { speak: speakOutput } = useVoiceOutput();
  const { isListening, isSupported: voiceInputSupported, toggleListening } = useVoiceInput((text) =>
    setInput(text)
  );

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (voiceOutput && last?.role === 'assistant' && last.id !== lastSpokenIdRef.current) {
      lastSpokenIdRef.current = last.id;
      speakOutput(last.content);
    }
  }, [messages, voiceOutput, speakOutput]);

  useEffect(() => {
    if (messages.length === 0) {
      const initWithOpenAI = async () => {
        setIsTyping(true);
        try {
          const opener = await fetchAIResponse(scenario.id, [
            { role: 'user', content: '[Please start the conversation as your character. Say your first line.]' },
          ]);
          setMessages([{ id: '0', role: 'assistant', content: opener }]);
          setUseOpenAI(true);
        } catch (err) {
          console.error('OpenAI failed:', err);
          setMessages([
            { id: '0', role: 'assistant', content: 'Unable to connect. Please check that OPENAI_API_KEY is set in Vercel.' },
          ]);
          setUseOpenAI(false);
        } finally {
          setIsTyping(false);
        }
      };
      initWithOpenAI();
    }
  }, [scenario.id]);

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

    try {
      let aiContent: string;
      if (useOpenAI) {
        const chatMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));
        aiContent = await fetchAIResponse(scenario.id, chatMessages);
      } else {
        aiContent = "Please refresh the page to reconnect. (OpenAI connection failed.)";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (userMessageCount + 1 >= MESSAGES_BEFORE_FEEDBACK) {
        const msgsForFeedback = [...messages, userMsg, aiMsg];
        if (useOpenAI) {
          try {
            const fb = await fetchFeedback(
              scenario.name,
              msgsForFeedback.map((m) => ({ role: m.role, content: m.content }))
            );
            setFeedback(fb);
          } catch {
            setFeedback(
              generateFeedback(
                msgsForFeedback.map((m) => ({ role: m.role, content: m.content }))
              )
            );
          }
        } else {
          setFeedback(
            generateFeedback(
              msgsForFeedback.map((m) => ({ role: m.role, content: m.content }))
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I had trouble responding. Please try again.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (feedback) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-12 text-2xl font-semibold text-[var(--text)]">
            Your feedback
          </h1>

          <div className="mb-10 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
              <p className="mb-2 text-sm text-[var(--text-muted)]">Confidence</p>
              <p className="text-4xl font-semibold text-[var(--accent)]">{feedback.confidence}%</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
              <p className="mb-2 text-sm text-[var(--text-muted)]">Clarity</p>
              <p className="text-4xl font-semibold text-[var(--accent)]">{feedback.clarity}%</p>
            </div>
            {feedback.professionalism != null && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
                <p className="mb-2 text-sm text-[var(--text-muted)]">Professionalism</p>
                <p className="text-4xl font-semibold text-[var(--accent)]">{feedback.professionalism}%</p>
              </div>
            )}
          </div>

          <div className="mb-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
            <h2 className="mb-4 font-medium text-[var(--text)]">Suggestions for improvement</h2>
            <ul className="space-y-3">
              {feedback.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-[var(--text-muted)]">
                  <span className="text-[var(--accent)]">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/practice/${scenario.id}`}
              className="inline-flex min-h-[48px] min-w-[140px] items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 font-medium text-white transition hover:bg-[var(--accent-light)]"
            >
              Try again
            </Link>
            <Link
              href="/scenarios"
              className="inline-flex min-h-[48px] min-w-[180px] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-8 py-3 font-medium text-[var(--text)] transition hover:bg-[var(--accent-soft)]"
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
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)] px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/scenarios"
            className="text-[var(--text-muted)] transition hover:text-[var(--text)]"
          >
            ← Back
          </Link>
          <h1 className="font-medium text-[var(--text)]">{scenario.name}</h1>
          <button
            type="button"
            onClick={() => setVoiceOutput((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--accent-soft)]"
            title={voiceOutput ? 'Turn off voice output' : 'Speak AI responses aloud'}
          >
            <SpeakerIcon active={voiceOutput} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 shadow-sm">
                <span className="inline-flex gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent-light)] [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent-light)] [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent-light)] [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] px-6 py-5">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <div className="relative flex flex-1 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={voiceInputSupported ? 'Type or tap mic to speak...' : 'Type your response...'}
                className="w-full rounded-full border border-[var(--border)] bg-[var(--bg)] px-5 py-4 pr-14 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                disabled={isTyping}
              />
              {voiceInputSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isTyping}
                  className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--accent-soft)] disabled:opacity-50"
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <MicIcon isListening={isListening} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="min-h-[52px] min-w-[120px] rounded-full bg-[var(--accent)] px-6 py-3 font-medium text-white transition hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
          <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
            {userMessageCount} / {MESSAGES_BEFORE_FEEDBACK} messages — feedback after {MESSAGES_BEFORE_FEEDBACK}
          </p>
        </form>
      </footer>
    </main>
  );
}
