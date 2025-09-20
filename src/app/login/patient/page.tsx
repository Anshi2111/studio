import { LoginForm } from '@/components/login-form';

export default function PatientLoginPage() {
  return <LoginForm userType="Patient" redirectUrl="/patient/dashboard" />;
}
