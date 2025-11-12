
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { problems } from "@/lib/problems";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

// A mock authentication check
const useMockAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd check a token, a cookie, or make an API call.
    // Here, we'll use sessionStorage to simulate a logged-in state for the demo.
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(loggedIn);
    setIsLoading(false);
  }, []);

  return { isAuthenticated, isLoading };
};

export default function ProblemsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useMockAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
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
                className="prose prose-sm text-muted-foreground max-w-none max-h-24 overflow-hidden mask-fade-to-bottom"
                dangerouslySetInnerHTML={{ __html: problem.description.split('<h3')[0] }} 
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
      <style jsx>{`
        .mask-fade-to-bottom {
          mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
