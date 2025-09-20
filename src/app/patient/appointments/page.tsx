import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Appointments</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Schedule New
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will allow you to schedule and manage your appointments with healthcare providers.</p>
        </CardContent>
      </Card>
    </div>
  );
}
