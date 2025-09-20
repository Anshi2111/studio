import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";

export default function PrescriptionsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Prescription Management</h1>
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Add New Prescription
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will allow you to manage and process prescriptions efficiently.</p>
        </CardContent>
      </Card>
    </div>
  );
}
