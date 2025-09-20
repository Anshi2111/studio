'use client';

import { PatientDashboardClient } from '@/components/dashboard/patient-dashboard-client';
import { useState, useEffect } from 'react';

export default function PatientDashboardPage() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Patient Dashboard</h1>
        {greeting && <p className="text-muted-foreground">{`${greeting}, Patient!`}</p>}
      </div>
      <PatientDashboardClient />
    </>
  );
}
