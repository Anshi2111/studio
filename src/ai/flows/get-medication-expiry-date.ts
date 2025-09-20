'use server';
/**
 * @fileOverview An AI agent that retrieves the expiry date of a medication from pharmacy records.
 *
 * - getMedicationExpiry - A function that takes a medication name and purchase date and returns the expiry date.
 * - MedicationExpiryInput - The input type for the getMedicationExpiry function.
 * - MedicationExpiryOutput - The return type for the getMedicationExpiry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getExpiryDateForMedication as getExpiryDateForMedicationTool } from '@/lib/pharmacy-tools';

const getExpiryDateForMedication = ai.defineTool(
  {
    name: 'getExpiryDateForMedication',
    description: 'Looks up the expiry date for a given medication from the pharmacy sales records based on its name and purchase date.',
    inputSchema: z.object({
      medicationName: z.string().describe('The name of the medication to look up.'),
      purchaseDate: z.string().describe('The date the medication was purchased by the patient in YYYY-MM-DD format.'),
      salesRecords: z.array(z.any()).describe('An array of sales record objects from the pharmacy.'),
    }),
    outputSchema: z.object({
        expiryDate: z.string().optional().describe('The expiry date of the medication in YYYY-MM-DD format.'),
    }),
  },
  async (input) => {
    return getExpiryDateForMedicationTool(input.medicationName, input.purchaseDate, input.salesRecords);
  }
);


const MedicationExpiryInputSchema = z.object({
  medicationName: z.string().describe('The name of the new medication.'),
  purchaseDate: z.string().describe('The date the patient purchased the medication.'),
  email: z.string().email().describe("The user's email address."),
  salesRecords: z.array(z.any()).describe('An array of sales record objects from the pharmacy.'),
});
export type MedicationExpiryInput = z.infer<typeof MedicationExpiryInputSchema>;

const MedicationExpiryOutputSchema = z.object({
  expiryDate: z.string().optional().describe('The expiry date of the medication found in the pharmacy records.'),
});
export type MedicationExpiryOutput = z.infer<typeof MedicationExpiryOutputSchema>;


export async function getMedicationExpiry(input: MedicationExpiryInput): Promise<MedicationExpiryOutput> {
  return getMedicationExpiryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationExpiryPrompt',
  input: {schema: MedicationExpiryInputSchema},
  output: {schema: MedicationExpiryOutputSchema},
  tools: [getExpiryDateForMedication],
  prompt: `You are a pharmacy assistant. Your task is to find the expiry date for a medication based on the patient's input.
  
  Use the provided tools to look up the expiry date from the pharmacy's sales records.

  Medication Name: {{{medicationName}}}
  Purchase Date: {{{purchaseDate}}}
  User Email: {{{email}}}
  
  If you find an expiry date, return it. If you cannot find a matching record, return nothing.`,
});

const getMedicationExpiryFlow = ai.defineFlow(
  {
    name: 'getMedicationExpiryFlow',
    inputSchema: MedicationExpiryInputSchema,
    outputSchema: MedicationExpiryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      return { expiryDate: undefined };
    }
    return output;
  }
);
