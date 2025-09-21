'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, User, Briefcase, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface MagicLinkFormProps {
  userType: 'patient' | 'pharmacist';
}

export function MagicLinkForm({ userType }: MagicLinkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = userType === 'patient' ? '/patient/dashboard' : '/pharmacy/dashboard';
  const title = userType === 'patient' ? 'Patient Portal' : 'Pharmacist Portal';
  const icon = userType === 'patient' ? <User className="h-8 w-8 text-primary" /> : <Briefcase className="h-8 w-8 text-primary" />;

  const handleMagicLinkSignIn = () => {
    setLoading(true);
    
    // In a real app, you would send a magic link via email.
    // For this environment, we will simulate a successful login and redirect.
    console.log(`Simulating magic link sign-in for ${email} as ${userType}`);

    toast({
        title: 'Login Successful!',
        description: 'Redirecting you to the dashboard...',
    });

    // We don't need a delay, just redirect.
    router.push(redirectPath);

    // No need to set loading to false as we are redirecting away.
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{icon}</div>
          <CardTitle className="text-3xl font-headline">{title}</CardTitle>
          <CardDescription>
            Enter your email to receive a magic sign-in link.
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleMagicLinkSignIn} className="w-full" disabled={loading || !email}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Send Magic Link
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
