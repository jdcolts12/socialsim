import { notFound } from 'next/navigation';
import PracticeClient from './PracticeClient';
import { SCENARIOS } from '@/lib/scenarios';

export default function PracticePage({ params }: { params: { scenarioId: string } }) {
  const scenario = SCENARIOS.find((s) => s.id === params.scenarioId);
  if (!scenario) notFound();

  return <PracticeClient scenario={scenario} />;
}
