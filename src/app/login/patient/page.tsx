'use client';

import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/components/login-form').then(mod => mod.LoginForm), { ssr: false });

export default function PatientLoginPage() {
  return <LoginForm userType="Patient" redirectUrl="/patient/dashboard" />;
}
