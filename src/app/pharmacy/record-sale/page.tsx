import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export default function RecordSalePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Record a Sale</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
           <CardDescription>
            Scan a medicine, enter the buyer’s phone number, and record the quantity sold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will allow you to record a new sale and link it to a patient.</p>
        </CardContent>
      </Card>
    </div>
  );
}
