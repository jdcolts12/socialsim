'use client';

import type { Sim, NeedType } from '@/lib/types';

const NEED_CONFIG: Record<NeedType, { label: string; color: string }> = {
  hunger: { label: 'Hunger', color: '#f59e0b' },
  energy: { label: 'Energy', color: '#3b82f6' },
  social: { label: 'Social', color: '#ec4899' },
  fun: { label: 'Fun', color: '#10b981' },
};

interface SimCardProps {
  sim: Sim;
  onBoost: (simId: string, need: NeedType, amount: number) => void;
  onRemove: (simId: string) => void;
  canRemove: boolean;
}

export default function SimCard({ sim, onBoost, onRemove, canRemove }: SimCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-700/50 bg-zinc-900/60 p-6 backdrop-blur-sm transition hover:border-zinc-600">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800 text-3xl">
            {sim.avatar}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{sim.name}</h2>
            <span className="text-sm text-zinc-400">{sim.mood}</span>
          </div>
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(sim.id)}
            className="text-xs text-zinc-500 transition hover:text-red-400"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-4">
        {(Object.keys(sim.needs) as NeedType[]).map((need) => (
          <div key={need}>
            <div className="mb-1 flex justify-between text-sm">
              <span style={{ color: NEED_CONFIG[need].color }}>{NEED_CONFIG[need].label}</span>
              <span className="text-zinc-400">{Math.round(sim.needs[need])}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${sim.needs[need]}%`,
                  backgroundColor: NEED_CONFIG[need].color,
                }}
              />
            </div>
            <div className="mt-1.5 flex gap-1">
              {[10, 25, 50].map((amt) => (
                <button
                  key={amt}
                  onClick={() => onBoost(sim.id, need, amt)}
                  className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs transition hover:bg-zinc-700"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
