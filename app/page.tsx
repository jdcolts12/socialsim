import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
          SocialSim
        </h1>
        <p className="mb-12 text-xl text-zinc-400">
          Practice real-life conversations with AI
        </p>
        <Link
          href="/scenarios"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-medium text-white transition hover:bg-indigo-500"
        >
          Get Started
          <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
