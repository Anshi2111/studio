import { InventoryClient } from '@/components/pharmacy-inventory-client';
import { Archive } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Archive className="h-8 w-8"/>
            Inventory Management
        </h1>
        <Button asChild>
          <Link href="/pharmacy/add-medicine">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground mb-6">
        View, search, and manage your entire medicine stock.
      </p>
      <InventoryClient />
    </div>
  );
}
