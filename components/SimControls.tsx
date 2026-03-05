'use client';

interface SimControlsProps {
  time: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onAddSim: () => void;
}

export default function SimControls({ time, speed, onSpeedChange, onAddSim }: SimControlsProps) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-700/50 bg-zinc-900/40 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div>
          <span className="text-xs text-zinc-500">Time</span>
          <p className="font-mono text-xl font-medium">
            {minutes}m {seconds}s
          </p>
        </div>
        <div>
          <span className="mb-1 block text-xs text-zinc-500">Speed</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  speed === s ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onAddSim}
        className="rounded-xl bg-violet-600 px-5 py-2.5 font-medium transition hover:bg-violet-500"
      >
        + Add Sim
      </button>
    </div>
  );
}
