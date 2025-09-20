'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated. Users should use role-specific login pages.
export default function DeprecatedLoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
