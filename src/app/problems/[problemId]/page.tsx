import { problems } from '@/lib/problems';
import { notFound } from 'next/navigation';
import CodingInterface from '@/components/problems/CodingInterface';
import type { Problem } from '@/lib/problems';

export function generateStaticParams() {
  return problems.map((problem) => ({
    problemId: problem.id,
  }));
}

export default function ProblemSolvingPage({ params }: { params: { problemId: string } }) {
  const problem = problems.find((p) => p.id === params.problemId) as Problem;

  if (!problem) {
    notFound();
  }

  return <CodingInterface problem={problem} />;
}
