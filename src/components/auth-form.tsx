'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, KeyRound, Loader2, User, Briefcase, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  userType: 'patient' | 'pharmacist';
}

export function AuthForm({ userType }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = userType === 'patient' ? '/patient/dashboard' : '/pharmacy/dashboard';
  const title = userType === 'patient' ? 'Patient Login' : 'Pharmacist Login';
  const icon = userType === 'patient' ? <User className="h-8 w-8 text-primary" /> : <Briefcase className="h-8 w-8 text-primary" />;

  const handleSignIn = () => {
    setLoading(true);
    
    // Simulate a successful login and redirect.
    console.log(`Simulating login for ${email} as ${userType}`);

    toast({
        title: 'Login Successful!',
        description: 'Redirecting you to the dashboard...',
    });

    router.push(redirectPath);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{icon}</div>
          <CardTitle className="text-3xl font-headline">{title}</CardTitle>
          <CardDescription>
            Enter your email and password to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
                />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
                />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleSignIn} className="w-full" disabled={loading || !email || !password}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
