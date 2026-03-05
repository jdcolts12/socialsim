import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';

export default function ScenariosPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-12 inline-block text-[var(--text-muted)] transition hover:text-[var(--text)]"
        >
          ← Back
        </Link>
        <h1 className="mb-2 text-3xl font-semibold text-[var(--text)]">
          Choose a scenario
        </h1>
        <p className="mb-12 text-[var(--text-muted)]">
          Pick a situation to practice your conversation skills
        </p>

        <div className="flex flex-col gap-4">
          {SCENARIOS.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/practice/${scenario.id}`}
              className="flex min-h-[88px] flex-col justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-8 py-6 shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
            >
              <h2 className="text-xl font-medium text-[var(--text)]">
                {scenario.name}
              </h2>
              <p className="mt-1 text-[var(--text-muted)]">
                {scenario.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
