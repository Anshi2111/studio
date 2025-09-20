'use client';

import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/components/login-form').then(mod => mod.LoginForm), { ssr: false });

export default function PharmacistLoginPage() {
  return <LoginForm userType="Pharmacist" redirectUrl="/pharmacy/dashboard" />;
}
