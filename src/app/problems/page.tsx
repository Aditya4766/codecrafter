import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { problems } from "@/lib/problems";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProblemsPage() {
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
