import { RecordSaleClient } from '@/components/pharmacy-record-sale-client';
import { DollarSign } from 'lucide-react';

export default function RecordSalePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <DollarSign className="h-8 w-8" /> Record a Sale
        </h1>
      </div>
       <p className="text-muted-foreground mb-6">
        Scan a medicine, enter the buyer’s phone number, and record the quantity sold to link the purchase to a patient account.
      </p>
      <RecordSaleClient />
    </div>
  );
}
