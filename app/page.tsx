'use client';

import { useState, useEffect } from 'react';

type Need = 'hunger' | 'energy' | 'social' | 'fun';

interface Sim {
  id: string;
  name: string;
  needs: Record<Need, number>;
  mood: string;
  avatar: string;
}

const AVATARS = ['👤', '👩', '👨', '🧑', '👧', '👦'];
const NAMES = ['Alex', 'Jordan', 'Sam', 'Riley', 'Casey', 'Morgan', 'Quinn', 'Avery'];

function getMood(needs: Record<Need, number>): string {
  const avg = Object.values(needs).reduce((a, b) => a + b, 0) / 4;
  if (avg >= 80) return 'Happy';
  if (avg >= 60) return 'Content';
  if (avg >= 40) return 'Neutral';
  if (needs.hunger < 30) return 'Hungry';
  if (needs.energy < 30) return 'Tired';
  if (needs.social < 30) return 'Lonely';
  if (needs.fun < 30) return 'Bored';
  return 'Stressed';
}

function createSim(id: string, name?: string): Sim {
  const needs = {
    hunger: 70 + Math.floor(Math.random() * 25),
    energy: 70 + Math.floor(Math.random() * 25),
    social: 70 + Math.floor(Math.random() * 25),
    fun: 70 + Math.floor(Math.random() * 25),
  };
  return {
    id,
    name: name || NAMES[Math.floor(Math.random() * NAMES.length)],
    needs,
    mood: getMood(needs),
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
  };
}

export default function SocialSim() {
  const [sims, setSims] = useState<Sim[]>(() => [
    createSim('1'),
    createSim('2'),
  ]);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
      setSims((prev) =>
        prev.map((sim) => {
          const decay = 0.3 * speed;
          const newNeeds = {
            hunger: Math.max(0, sim.needs.hunger - decay),
            energy: Math.max(0, sim.needs.energy - decay),
            social: Math.max(0, sim.needs.social - decay),
            fun: Math.max(0, sim.needs.fun - decay),
          };
          return {
            ...sim,
            needs: newNeeds,
            mood: getMood(newNeeds),
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [speed]);

  const boostNeed = (simId: string, need: Need, amount: number) => {
    setSims((prev) =>
      prev.map((sim) =>
        sim.id === simId
          ? {
              ...sim,
              needs: {
                ...sim.needs,
                [need]: Math.min(100, sim.needs[need] + amount),
              },
              mood: getMood({
                ...sim.needs,
                [need]: Math.min(100, sim.needs[need] + amount),
              }),
            }
          : sim
      )
    );
  };

  const addSim = () => {
    setSims((prev) => [...prev, createSim(String(Date.now()))]);
  };

  const removeSim = (id: string) => {
    setSims((prev) => prev.filter((s) => s.id !== id));
  };

  const needColors: Record<Need, string> = {
    hunger: 'var(--hunger)',
    energy: 'var(--energy)',
    social: 'var(--social)',
    fun: 'var(--fun)',
  };

  const needLabels: Record<Need, string> = {
    hunger: 'Hunger',
    energy: 'Energy',
    social: 'Social',
    fun: 'Fun',
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
          Social Sim
        </h1>
        <p className="text-zinc-400 text-lg">
          Manage your sims. Keep their needs up. Watch them thrive.
        </p>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500">Time:</span>
            <span className="font-mono text-xl font-medium">{Math.floor(time / 60)}m {time % 60}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm">Speed:</span>
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  speed === s
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
          <button
            onClick={addSim}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium transition"
          >
            + Add Sim
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sims.map((sim) => (
            <div
              key={sim.id}
              className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{sim.avatar}</span>
                  <div>
                    <h2 className="text-xl font-semibold">{sim.name}</h2>
                    <span className="text-sm text-zinc-400">{sim.mood}</span>
                  </div>
                </div>
                {sims.length > 1 && (
                  <button
                    onClick={() => removeSim(sim.id)}
                    className="text-zinc-500 hover:text-red-400 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {(Object.keys(sim.needs) as Need[]).map((need) => (
                  <div key={need}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: needColors[need] }}>{needLabels[need]}</span>
                      <span className="text-zinc-400">{Math.round(sim.needs[need])}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${sim.needs[need]}%`,
                          backgroundColor: needColors[need],
                        }}
                      />
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[10, 25, 50].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => boostNeed(sim.id, need, amt)}
                          className="text-xs px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition"
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-zinc-500 text-sm">
        Click +10, +25, +50 to boost needs. Add more sims to manage. Deploy to Vercel to share!
      </footer>
    </main>
  );
}
