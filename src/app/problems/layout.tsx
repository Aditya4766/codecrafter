
"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Code, LogOut, History, UserCircle } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";

export default function ProblemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link href="/problems" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">CodeCrafter</h1>
        </Link>
        <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} alt="User" />
                            <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile/submissions" className="cursor-pointer w-full flex items-center">
                            <History className="mr-2 h-4 w-4" />
                            <span>My Submissions</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
