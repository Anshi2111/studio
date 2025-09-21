'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthErrorCodes,
} from 'firebase/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, AlertCircle, User, Briefcase, KeyRound } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AuthFormProps {
  userType: 'patient' | 'pharmacist';
}

export function AuthForm({ userType }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = userType === 'patient' ? '/patient/dashboard' : '/pharmacy/dashboard';
  const title = userType === 'patient' ? 'Patient Portal' : 'Pharmacist Portal';
  const icon = userType === 'patient' ? <User className="h-8 w-8 text-primary" /> : <Briefcase className="h-8 w-8 text-primary" />;

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    setLoading(true);
    setError(null);
    try {
      if (action === 'signIn') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Login Successful!',
          description: `Welcome back to the ${title}.`,
        });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Account Created!',
          description: `Welcome to the ${title}. You are now signed in.`,
        });
      }
      router.push(redirectPath);
    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (err.code) {
        case AuthErrorCodes.INVALID_PASSWORD:
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/user-not-found':
        case AuthErrorCodes.USER_DELETED:
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-credential':
             errorMessage = 'Invalid email or password. Please check your credentials and try again.';
             break;
        case AuthErrorCodes.INVALID_EMAIL:
          errorMessage = 'Please enter a valid email address.';
          break;
        case AuthErrorCodes.EMAIL_EXISTS:
           errorMessage = 'An account with this email already exists. Please sign in instead.';
           break;
        case AuthErrorCodes.WEAK_PASSWORD:
            errorMessage = 'The password is too weak. It must be at least 6 characters long.';
            break;
        default:
          console.error(err);
          break;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{icon}</div>
          <CardTitle className="text-3xl font-headline">{title}</CardTitle>
          <CardDescription>
            Sign in or create an account to continue.
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
          {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={() => handleAuthAction('signIn')} className="w-full" disabled={loading || !email || !password}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
          <Button onClick={() => handleAuthAction('signUp')} className="w-full" variant="outline" disabled={loading || !email || !password}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
