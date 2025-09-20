'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bot, Loader2, AlertCircle, Sparkles, Lightbulb } from 'lucide-react';
import type { MedicationInteractionOutput } from '@/ai/flows/medication-interaction-guide';
import { checkMedicationInteractions } from '@/app/actions/medication-guide';

const formSchema = z.object({
  medicationName: z.string().min(2, { message: 'Medication name must be at least 2 characters.' }),
  patientHistory: z.string().min(10, { message: 'Patient history must be at least 10 characters.' }),
});

export function MedicationGuideClient() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<MedicationInteractionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicationName: '',
      patientHistory: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const response = await checkMedicationInteractions(values);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'An unknown error occurred.');
      }
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Bot className="h-6 w-6" />
            AI-Powered Medication Guide
          </CardTitle>
          <CardDescription>
            Enter a medication and patient history to check for potential interactions and side effects. This guide is for informational purposes only and is not a substitute for professional medical advice.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="medicationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ibuprofen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Medical History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Allergic to penicillin. Currently taking Lisinopril for high blood pressure."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Check Interactions'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="flex flex-col gap-4">
        {isPending && (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Bot className="h-10 w-10 animate-bounce" />
                <p className="font-medium">Our AI is analyzing the information...</p>
                <p className="text-sm">This may take a moment.</p>
            </div>
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {result && (
            <Card className="shadow-lg animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Analysis Complete
                    </CardTitle>
                    <CardDescription>
                        Based on the information provided, here are the potential considerations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible defaultValue="interactions" className="w-full">
                        <AccordionItem value="interactions">
                            <AccordionTrigger className="text-lg font-semibold">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                    Potential Interactions
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 text-muted-foreground">
                                {result.interactions}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="side-effects">
                            <AccordionTrigger className="text-lg font-semibold">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                                    Potential Side Effects
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 text-muted-foreground">
                                {result.sideEffects}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
