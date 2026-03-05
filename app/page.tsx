'use client';

import { useState, useEffect } from 'react';
import SimCard from '@/components/SimCard';
import SimControls from '@/components/SimControls';
import { createSim, decayNeeds, boostNeed, getMood } from '@/lib/simLogic';
import type { Sim, NeedType } from '@/lib/types';

export default function SocialSim() {
  const [sims, setSims] = useState<Sim[]>(() => [createSim('1'), createSim('2')]);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
      setSims((prev) =>
        prev.map((sim) => {
          const newNeeds = decayNeeds(sim.needs, 0.3 * speed);
          return { ...sim, needs: newNeeds, mood: getMood(newNeeds) };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [speed]);

  const handleBoost = (simId: string, need: NeedType, amount: number) => {
    setSims((prev) =>
      prev.map((sim) =>
        sim.id === simId
          ? { ...sim, needs: boostNeed(sim.needs, need, amount), mood: getMood(boostNeed(sim.needs, need, amount)) }
          : sim
      )
    );
  };

  const handleAddSim = () => setSims((prev) => [...prev, createSim(String(Date.now()))]);
  const handleRemoveSim = (id: string) => setSims((prev) => prev.filter((s) => s.id !== id));

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mx-auto mb-12 max-w-4xl">
        <h1 className="mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Social Sim
        </h1>
        <p className="text-lg text-zinc-400">Manage your sims. Keep their needs up. Watch them thrive.</p>
      </header>

      <div className="mx-auto max-w-4xl space-y-6">
        <SimControls time={time} speed={speed} onSpeedChange={setSpeed} onAddSim={handleAddSim} />

        <div className="grid gap-6 md:grid-cols-2">
          {sims.map((sim) => (
            <SimCard
              key={sim.id}
              sim={sim}
              onBoost={handleBoost}
              onRemove={handleRemoveSim}
              canRemove={sims.length > 1}
            />
          ))}
        </div>
      </div>

      <footer className="mx-auto mt-16 max-w-4xl text-center text-sm text-zinc-500">
        Click +10, +25, +50 to boost needs. Add more sims to manage.
      </footer>
    </main>
  );
}
