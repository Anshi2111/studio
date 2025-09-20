'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function MagicLinkForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // This effect runs on the client-side when the component mounts.
    // It checks if the current URL is a sign-in link.
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailFromStorage = window.localStorage.getItem('emailForSignIn');
      if (!emailFromStorage) {
        // If the email is not in local storage, prompt the user for it.
        emailFromStorage = window.prompt('Please provide your email for confirmation');
      }

      if (emailFromStorage) {
        setLoading(true);
        signInWithEmailLink(auth, emailFromStorage, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            // You can check if the user is new or returning:
            // const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
            toast({
              title: 'Successfully Signed In!',
              description: 'Welcome back to Healthure.',
            });
            router.push('/patient/dashboard'); // Redirect to a dashboard page after login.
          })
          .catch((error) => {
            setError('Error signing in with email link. The link may be expired or invalid.');
            console.error(error);
            setLoading(false);
            setIsVerifying(false);
          });
      } else {
        setIsVerifying(false);
      }
    } else {
      setIsVerifying(false);
    }
  }, [router, toast]);


  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) must be
      // authorized in the Firebase Console.
      url: window.location.origin + '/login',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // The link was successfully sent. Inform the user.
      // Save the email locally so you don't need to ask the user for it again
      // if they open the link on the same device.
      window.localStorage.setItem('emailForSignIn', email);
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
        </div>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            {emailSent ? 'Check your inbox for the magic link!' : 'Enter your email to receive a login link.'}
          </CardDescription>
        </CardHeader>

        {emailSent ? (
          <CardContent>
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Email Sent!</AlertTitle>
              <AlertDescription>
                We've sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in. You can close this window.
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
