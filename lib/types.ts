export type NeedType = 'hunger' | 'energy' | 'social' | 'fun';

export interface Sim {
  id: string;
  name: string;
  needs: Record<NeedType, number>;
  mood: string;
  avatar: string;
}
