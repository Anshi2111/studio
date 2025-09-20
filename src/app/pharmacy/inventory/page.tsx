import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";

export default function InventoryPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Inventory Tracking</h1>
        <Button>
          <PackagePlus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will allow you to track medication stock levels and expiry dates.</p>
        </CardContent>
      </Card>
    </div>
  );
}
