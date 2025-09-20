'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  userType: 'Patient' | 'Pharmacist';
  redirectUrl: string;
}

export function LoginForm({ userType, redirectUrl }: LoginFormProps) {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, you'd have authentication logic here.
    // For this demo, we just redirect.
    router.push(redirectUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">{userType} Portal</CardTitle>
          <CardDescription>Welcome back! Please enter your details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="e.g., (123) 456-7890" defaultValue={userType === 'Patient' ? '123-456-7890' : '987-654-3210'} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" defaultValue="password" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
