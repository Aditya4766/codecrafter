
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { problems } from "@/lib/problems";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser } from '@/firebase';

export default function ProblemsPage() {
  const router = useRouter();
  const { user, loading: isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold font-headline">Practice Problems</h1>
        <p className="text-muted-foreground">Master your coding skills with our curated set of practice problems.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {problems.map((problem) => (
          <Card key={problem.id} className="flex flex-col h-full hover:shadow-lg transition-shadow group border-none bg-card shadow-sm">
            <CardHeader className="flex-grow pb-4">
              <div className="flex flex-col gap-3">
                <Badge 
                  variant={problem.difficulty === 'Easy' ? 'secondary' : problem.difficulty === 'Medium' ? 'default' : 'destructive'}
                  className={problem.difficulty === 'Medium' ? 'bg-amber-500 text-white w-fit' : 'w-fit'}
                >
                  {problem.difficulty}
                </Badge>
                <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                    {problem.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardFooter className="pt-0">
                <Button asChild className="w-full">
                    <Link href={`/problems/${problem.id}`}>
                        Solve Problem <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
