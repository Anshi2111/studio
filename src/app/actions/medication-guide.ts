'use server';

import { getMedicationInteractions } from '@/ai/flows/medication-interaction-guide';
import type { MedicationInteractionInput, MedicationInteractionOutput } from '@/ai/flows/medication-interaction-guide';
import { getMedicationInfoFromBarcode } from '@/ai/flows/barcode-medication-info';
import type { BarcodeMedicationInfoInput, BarcodeMedicationInfoOutput } from '@/ai/flows/barcode-medication-info';
import { getMedicationExpiry } from '@/ai/flows/get-medication-expiry-date';
import type { MedicationExpiryInput, MedicationExpiryOutput } from '@/ai/flows/get-medication-expiry-date';


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

export async function getBarcodeInfo(input: BarcodeMedicationInfoInput): Promise<{
  success: boolean;
  data?: BarcodeMedicationInfoOutput;
  error?: string;
}> {
  try {
    const result = await getMedicationInfoFromBarcode(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in barcode medication info flow:', error);
    return { success: false, error: 'Failed to get medication info from barcode. Please try again.' };
  }
}

export async function findMedicationExpiryDate(input: MedicationExpiryInput): Promise<{
    success: boolean;
    data?: MedicationExpiryOutput;
    error?: string;
}> {
    try {
        const result = await getMedicationExpiry(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error in medication expiry flow:', error);
        return { success: false, error: 'Failed to get medication expiry. Please try again.' };
    }
}
