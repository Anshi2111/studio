// This page is deprecated. The new login page is at /login
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedPatientLoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);
  return null;
}
