'use client';

import { PharmacyDashboardClient } from '@/components/dashboard/pharmacy-dashboard-client';
import { useState, useEffect } from 'react';

export default function PharmacyDashboardPage() {
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
            <h1 className="text-3xl font-bold tracking-tight font-headline">Pharmacy Dashboard</h1>
            {greeting && <p className="text-muted-foreground">{`${greeting}, Pharmacist!`}</p>}
        </div>
      <PharmacyDashboardClient />
    </>
  );
}
