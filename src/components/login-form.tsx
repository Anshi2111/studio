'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  userType: 'Patient' | 'Pharmacist';
  redirectUrl: string;
}

export function LoginForm({ userType, redirectUrl }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState(userType === 'Patient' ? '123-456-7890' : '987-654-3210');


  const handleSendOtp = () => {
    // In a real app, you'd call an API to send the OTP.
    // For this demo, we'll just simulate it.
    setOtpSent(true);
    toast({
      title: 'OTP Sent!',
      description: 'A one-time password has been sent to your phone. (Hint: It\'s 123456)',
    });
  };

  const handleLogin = () => {
    if (otp === '123456') { // Mock OTP check for both users
      router.push(redirectUrl);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect. Please try again.',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOtp();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">{userType} Portal</CardTitle>
          <CardDescription>
            Enter your phone number to receive a login code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="e.g., (123) 456-7890" value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={otpSent} />
              </div>
              
              {otpSent && (
                 <div className="flex flex-col space-y-1.5 animate-in fade-in-50">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input id="otp" type="text" placeholder="e.g., 123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit}>
            {otpSent ? (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Verify & Login
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" /> Send OTP
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
