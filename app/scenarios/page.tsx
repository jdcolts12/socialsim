import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';

export default function ScenariosPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-block text-sm text-zinc-500 transition hover:text-zinc-300">
          ← Back
        </Link>
        <h1 className="mb-2 text-3xl font-bold">Choose a scenario</h1>
        <p className="mb-10 text-zinc-400">Pick a situation to practice your conversation skills</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/practice/${scenario.id}`}
              className="group rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-6 transition hover:border-indigo-500/50 hover:bg-zinc-900/80"
            >
              <h2 className="mb-2 font-semibold text-white group-hover:text-indigo-400">
                {scenario.name}
              </h2>
              <p className="text-sm text-zinc-500">{scenario.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
