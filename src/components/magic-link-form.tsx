'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, AlertCircle, User, Briefcase } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface MagicLinkFormProps {
  userType: 'patient' | 'pharmacist';
}

export function MagicLinkForm({ userType }: MagicLinkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const redirectPath = userType === 'patient' ? '/patient/dashboard' : '/pharmacy/dashboard';
  const loginPath = userType === 'patient' ? '/login/patient' : '/login/pharmacist';
  const title = userType === 'patient' ? 'Patient Portal' : 'Pharmacist Portal';
  const icon = userType === 'patient' ? <User className="h-8 w-8 text-primary" /> : <Briefcase className="h-8 w-8 text-primary" />;


  useEffect(() => {
    // This is the production logic for handling the magic link.
    // It will not run in the preview environment because the hostname does not match.
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailFromStorage = window.localStorage.getItem(`emailForSignIn-${userType}`);
      if (!emailFromStorage) {
        // If the email is not in storage, it might be because the user is on a different device.
        // We can prompt them for their email.
        emailFromStorage = window.prompt(`Please provide your email for confirmation (${userType})`);
      }

      if (emailFromStorage) {
        setLoading(true);
        signInWithEmailLink(auth, emailFromStorage, window.location.href)
          .then((result) => {
            window.localStorage.removeItem(`emailForSignIn-${userType}`);
            toast({
              title: 'Successfully Signed In!',
              description: `Welcome to the ${title}.`,
            });
            router.push(redirectPath);
          })
          .catch((error) => {
            setError('Error signing in with email link. The link may be expired or invalid. Please try again.');
            console.error(error);
            setLoading(false);
            setIsVerifying(false);
          });
      } else {
        // No email provided or found.
        setIsVerifying(false);
      }
    } else {
      setIsVerifying(false);
    }
  }, [router, toast, userType, redirectPath, title]);


  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // --- MOCK LOGIN FOR DEVELOPMENT/PREVIEW ENVIRONMENT ---
    // This simulates a successful login without sending an email.
    if (process.env.NODE_ENV !== 'production') {
        console.log("MOCK LOGIN: Simulating magic link sign-in for development environment.");
        toast({
            title: 'Login Successful (Simulated)',
            description: `Redirecting to the ${title}...`,
        });
        router.push(redirectPath);
        return; // Important: exit the function here
    }

    
    // --- PRODUCTION LOGIC ---
    const actionCodeSettings = {
      url: `${window.location.origin}${loginPath}`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(`emailForSignIn-${userType}`, email);
      setEmailSent(true);
      toast({
        title: 'Check Your Email',
        description: `A sign-in link has been sent to ${email}.`,
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Error Sending Link',
        description: 'Could not send the magic link. Please try again.',
      });
    } finally {
      setLoading(false);
    }
    
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Verifying your magic link...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{icon}</div>
          <CardTitle className="text-3xl font-headline">{title}</CardTitle>
          <CardDescription>
            {emailSent ? 'Check your email for the magic link.' : 'Enter your email to receive a passwordless login link.'}
          </CardDescription>
        </CardHeader>

        {emailSent ? (
          <CardContent>
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Magic Link Sent!</AlertTitle>
              <AlertDescription>
                Please check your inbox at {email} and click the link to sign in.
              </AlertDescription>
            </Alert>
          </CardContent>
        ) : (
          <form onSubmit={handleMagicLinkSignIn}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="e.g., you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Login Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Send Magic Link
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
