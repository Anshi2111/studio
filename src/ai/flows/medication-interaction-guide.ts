'use server';
/**
 * @fileOverview An AI agent that provides information about potential medication interactions and side effects.
 *
 * - getMedicationInteractions - A function that takes medication name and patient history and returns possible interactions and side effects.
 * - MedicationInteractionInput - The input type for the getMedicationInteractions function.
 * - MedicationInteractionOutput - The return type for the getMedicationInteractions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationInteractionInputSchema = z.object({
  medicationName: z.string().describe('The name of the new medication.'),
  patientHistory: z.string().describe('The patient medical history and current medications.'),
});
export type MedicationInteractionInput = z.infer<typeof MedicationInteractionInputSchema>;

const MedicationInteractionOutputSchema = z.object({
  interactions: z.string().describe('The potential interactions of the new medication with the patient history.'),
  sideEffects: z.string().describe('The potential side effects of the new medication for the patient.'),
});
export type MedicationInteractionOutput = z.infer<typeof MedicationInteractionOutputSchema>;

export async function getMedicationInteractions(input: MedicationInteractionInput): Promise<MedicationInteractionOutput> {
  return medicationInteractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationInteractionPrompt',
  input: {schema: MedicationInteractionInputSchema},
  output: {schema: MedicationInteractionOutputSchema},
  prompt: `You are a pharmacist providing information about medication interactions and side effects.

  Based on the new medication and patient history, provide a summary of potential interactions and side effects.

  New Medication: {{{medicationName}}}
  Patient History: {{{patientHistory}}}`,
});

const medicationInteractionFlow = ai.defineFlow(
  {
    name: 'medicationInteractionFlow',
    inputSchema: MedicationInteractionInputSchema,
    outputSchema: MedicationInteractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
