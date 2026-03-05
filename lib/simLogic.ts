import type { Sim, NeedType } from './types';

const AVATARS = ['👤', '👩', '👨', '🧑', '👧', '👦'];
const NAMES = ['Alex', 'Jordan', 'Sam', 'Riley', 'Casey', 'Morgan', 'Quinn', 'Avery'];

export function getMood(needs: Record<NeedType, number>): string {
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

export function createSim(id: string): Sim {
  const needs = {
    hunger: 70 + Math.floor(Math.random() * 25),
    energy: 70 + Math.floor(Math.random() * 25),
    social: 70 + Math.floor(Math.random() * 25),
    fun: 70 + Math.floor(Math.random() * 25),
  };
  return {
    id,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    needs,
    mood: getMood(needs),
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
  };
}

export function decayNeeds(needs: Record<NeedType, number>, rate: number): Record<NeedType, number> {
  return {
    hunger: Math.max(0, needs.hunger - rate),
    energy: Math.max(0, needs.energy - rate),
    social: Math.max(0, needs.social - rate),
    fun: Math.max(0, needs.fun - rate),
  };
}

export function boostNeed(needs: Record<NeedType, number>, need: NeedType, amount: number): Record<NeedType, number> {
  return {
    ...needs,
    [need]: Math.min(100, needs[need] + amount),
  };
}
