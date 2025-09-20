import { LoginForm } from '@/components/login-form';

export default function PharmacistLoginPage() {
  return <LoginForm userType="Pharmacist" redirectUrl="/pharmacy/dashboard" />;
}
