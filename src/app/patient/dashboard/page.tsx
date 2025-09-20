import { PatientDashboardClient } from '@/components/dashboard/patient-dashboard-client';

export default function PatientDashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">Patient Dashboard</h1>
      <PatientDashboardClient />
    </>
  );
}
