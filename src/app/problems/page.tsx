"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
      <h1 className="text-3xl font-bold mb-8 font-headline">Practice Problems</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <Card key={problem.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{problem.title}</CardTitle>
                <Badge 
                  variant={problem.difficulty === 'Easy' ? 'secondary' : problem.difficulty === 'Medium' ? 'default' : 'destructive'}
                  className={problem.difficulty === 'Medium' ? 'bg-amber-500 text-white' : ''}
                >
                  {problem.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div 
                className="prose prose-sm text-muted-foreground max-w-none break-words whitespace-normal prose-pre:whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: problem.description }} 
              />
            </CardContent>
            <CardFooter>
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
