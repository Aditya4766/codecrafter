"use client";

import { useState, useMemo } from "react";
import { useCollection, useUser, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Trash2, 
  Eye, 
  Search, 
  Trophy, 
  Code2, 
  Clock, 
  Activity,
  Lightbulb,
  Zap,
  BrainCircuit,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Editor } from "@monaco-editor/react";

export default function SubmissionsPage() {
  const { user } = useUser();
  const db = useFirestore();
  
  const submissionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'submissions'),
      orderBy('submittedAt', 'desc')
    );
  }, [db, user]);

  const { data: submissions, loading } = useCollection(submissionsQuery);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((s: any) => {
      const matchesSearch = s.problemTitle?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || s.submissionStatus === filterStatus;
      const matchesDifficulty = filterDifficulty === "all" || s.difficulty === filterDifficulty;
      const matchesLanguage = filterLanguage === "all" || s.language === filterLanguage;
      return matchesSearch && matchesStatus && matchesDifficulty && matchesLanguage;
    });
  }, [submissions, search, filterStatus, filterDifficulty, filterLanguage]);

  const stats = useMemo(() => {
    if (!submissions) return null;
    const total = submissions.length;
    const accepted = submissions.filter((s: any) => s.submissionStatus === "Accepted").length;
    const uniqueSolved = new Set(submissions.filter((s: any) => s.submissionStatus === "Accepted").map((s: any) => s.problemId)).size;
    
    const languages = submissions.reduce((acc: any, s: any) => {
      acc[s.language] = (acc[s.language] || 0) + 1;
      return acc;
    }, {});
    const favLang = Object.entries(languages).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A";

    const avgHints = submissions.reduce((acc: number, s: any) => acc + (s.AIHintLevelUsed || 0), 0) / (total || 1);

    return { total, accepted, uniqueSolved, favLang, avgHints };
  }, [submissions]);

  const handleDelete = (id: string) => {
    if (!db || !user) return;
    const docRef = doc(db, 'users', user.uid, 'submissions', id);
    deleteDoc(docRef)
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleClearAll = () => {
    if (!db || !user || !submissions) return;
    const batch = writeBatch(db);
    submissions.forEach((s: any) => {
      batch.delete(doc(db, 'users', user.uid, 'submissions', s.id));
    });
    batch.commit()
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: `/users/${user.uid}/submissions`,
          operation: 'write',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted": return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
      case "Wrong Answer": return <Badge variant="destructive">Wrong Answer</Badge>;
      case "Compilation Error": return <Badge className="bg-orange-500 hover:bg-orange-600">Compilation Error</Badge>;
      case "Runtime Error": return <Badge className="bg-purple-500 hover:bg-purple-600">Runtime Error</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return <Badge variant="secondary">Easy</Badge>;
      case "Medium": return <Badge className="bg-amber-500 text-white">Medium</Badge>;
      case "Hard": return <Badge variant="destructive">Hard</Badge>;
      default: return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <History className="h-8 w-8 text-primary" />
          Submission History
        </h1>
        <p className="text-muted-foreground">Track your progress and review past solutions.</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-none bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueSolved}</div>
              <p className="text-xs text-muted-foreground">Unique accepted solutions</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-green-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">{stats.accepted} of {stats.total} attempts</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-amber-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Language</CardTitle>
              <Code2 className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{stats.favLang}</div>
              <p className="text-xs text-muted-foreground">Based on submission volume</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-blue-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Hints Used</CardTitle>
              <Lightbulb className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgHints.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Mentor guidance per problem</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-none shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by problem title..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Wrong Answer">Wrong Answer</SelectItem>
                <SelectItem value="Compilation Error">Compile Error</SelectItem>
                <SelectItem value="Runtime Error">Runtime Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulty</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Langs</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-destructive text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your entire submission history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Problem</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-60">
                    <Activity className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-semibold text-lg">No submissions yet.</p>
                    <p className="text-sm">Solve a problem and click Submit to build your history.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((s: any) => (
                <TableRow key={s.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{s.problemTitle}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.problemId}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getDifficultyBadge(s.difficulty)}</TableCell>
                  <TableCell className="capitalize">{s.language}</TableCell>
                  <TableCell>{getStatusBadge(s.submissionStatus)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.submittedAt?.toDate ? format(s.submittedAt.toDate(), "MMM d, yyyy • HH:mm") : "Just now"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
                          <DialogHeader className="p-6 pb-2">
                            <div className="flex items-center justify-between gap-4">
                              <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                  {s.problemTitle}
                                  {getStatusBadge(s.submissionStatus)}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 text-sm">
                                  {getDifficultyBadge(s.difficulty)} • {s.language.toUpperCase()} • {s.submittedAt?.toDate ? format(s.submittedAt.toDate(), "PPpp") : "Just now"}
                                </DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>
                          
                          <div className="flex-1 grid md:grid-cols-[1fr_240px] gap-0 overflow-hidden border-t">
                            <div className="bg-[#1e1e1e] flex flex-col h-[400px]">
                              <div className="flex items-center gap-2 px-4 py-2 bg-background border-b text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                <Code2 className="h-3 w-3" /> Submitted Code
                              </div>
                              <div className="flex-1">
                                <Editor
                                  height="100%"
                                  language={s.language === 'cpp' ? 'cpp' : s.language}
                                  theme="vs-dark"
                                  value={s.submittedCode}
                                  options={{ readOnly: true, fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 16 } }}
                                />
                              </div>
                            </div>
                            
                            <div className="p-6 bg-muted/30 border-l space-y-6">
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                  <Activity className="h-3.5 w-3.5" /> Performance
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center bg-card p-2 rounded border text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time</span>
                                    <span className="font-mono font-bold">{s.executionTime || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-card p-2 rounded border text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Memory</span>
                                    <span className="font-mono font-bold">{s.memoryUsage ? `${s.memoryUsage} KB` : "N/A"}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                  <BrainCircuit className="h-3.5 w-3.5" /> AI Metadata
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center bg-card p-2 rounded border text-sm">
                                    <span className="text-muted-foreground">Hint Level Used</span>
                                    <Badge variant="outline" className="font-mono">{s.AIHintLevelUsed !== undefined ? `Level ${s.AIHintLevelUsed + 1}` : "None"}</Badge>
                                  </div>
                                  <div className="bg-card p-3 rounded border text-sm space-y-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Estimated Complexity</span>
                                    <div className="flex flex-col gap-1 font-mono text-xs">
                                      <div className="flex justify-between"><span>Time:</span> <span className="text-primary font-bold">{s.estimatedTimeComplexity || "O(?)"}</span></div>
                                      <div className="flex justify-between"><span>Space:</span> <span className="text-accent font-bold">{s.estimatedSpaceComplexity || "O(?)"}</span></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter className="p-4 border-t bg-muted/20">
                            <Button variant="outline" onClick={() => window.location.href = `/problems/${s.problemId}`}>
                              Try Problem Again
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
                            <AlertDialogDescription>This will remove this specific entry from your history. This action is permanent.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(s.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
