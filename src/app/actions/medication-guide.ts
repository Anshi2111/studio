'use server';

import { getMedicationInteractions } from '@/ai/flows/medication-interaction-guide';
import type { MedicationInteractionInput, MedicationInteractionOutput } from '@/ai/flows/medication-interaction-guide';

export async function checkMedicationInteractions(input: MedicationInteractionInput): Promise<{
  success: boolean;
  data?: MedicationInteractionOutput;
  error?: string;
}> {
  try {
    const result = await getMedicationInteractions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in medication interaction flow:', error);
    return { success: false, error: 'Failed to get medication interaction guide. Please try again.' };
  }
}
