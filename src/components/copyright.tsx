'use client';

import { useState, useEffect } from 'react';

export function Copyright() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <p>&copy; {year} All rights reserved.</p>
}
