import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-5 text-5xl font-semibold tracking-tight text-[var(--text)] md:text-6xl">
          SocialSim
        </h1>
        <p className="mb-16 text-xl text-[var(--text-muted)]">
          Practice real-life conversations with AI
        </p>
        <Link
          href="/scenarios"
          className="inline-flex min-h-[56px] min-w-[200px] items-center justify-center rounded-full bg-[var(--accent)] px-12 py-4 text-lg font-medium text-white transition hover:bg-[var(--accent-light)]"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
