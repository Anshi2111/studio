'use server';
/**
 * @fileOverview An AI agent that retrieves medicine details from Firestore or a public source.
 *
 * - getMedicineDetails - A function that takes a QR code and returns medicine details.
 * - MedicineDetailsInput - The input type for the getMedicineDetails function.
 * - MedicineDetailsOutput - The return type for the getMedicineDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

// Define Schemas
const MedicineDetailsInputSchema = z.object({
    qrCode: z.string().describe('The unique QR code ID of the medicine.'),
});
export type MedicineDetailsInput = z.infer<typeof MedicineDetailsInputSchema>;

const MedicineDetailsOutputSchema = z.object({
    qrCode: z.string(),
    name: z.string(),
    batchNo: z.string(),
    mfgDate: z.string(),
    expDate: z.string(),
    quantity: z.number(),
    supplier: z.string(),
    source: z.enum(['firestore', 'public_api']).describe('The source of the medicine data.'),
});
export type MedicineDetailsOutput = z.infer<typeof MedicineDetailsOutputSchema>;


// Tool to get medicine from Firestore
const getMedicineFromFirestore = ai.defineTool(
    {
        name: 'getMedicineFromFirestore',
        description: 'Retrieves medicine details from the Firestore database using the QR code.',
        inputSchema: z.object({ qrCode: z.string() }),
        outputSchema: MedicineDetailsOutputSchema.omit({ source: true }).optional(),
    },
    async ({ qrCode }) => {
        console.log(`Searching Firestore for QR code: ${qrCode}`);
        const docRef = doc(db, 'medicines', qrCode);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Found in Firestore:", docSnap.data());
            return docSnap.data() as z.infer<ReturnType<typeof MedicineDetailsOutputSchema.omit>>;
        }
        console.log("Not found in Firestore.");
        return undefined;
    }
);

// Tool to get medicine from a public source (mocked)
const getMedicineFromPublicSource = ai.defineTool(
    {
        name: 'getMedicineFromPublicSource',
        description: 'Fetches medicine details from a public API if not found in Firestore. This is a mock tool.',
        inputSchema: z.object({ qrCode: z.string() }),
        outputSchema: MedicineDetailsOutputSchema.omit({ source: true }).optional(),
    },
    async ({ qrCode }) => {
        console.log(`Searching public source for QR code: ${qrCode}`);
        // In a real app, you would call a public API here.
        // For this example, we return mock data if the QR code is a "known" mock value.
        if (qrCode === 'public-paracetamol-123') {
            const mockData = {
                qrCode,
                name: 'Paracetamol 500mg (from Public API)',
                batchNo: 'PUB-XYZ-789',
                mfgDate: '2024-01-01',
                expDate: '2026-12-31',
                quantity: 100,
                supplier: 'Public Pharma Co.',
            };
            console.log("Found in public source (mock):", mockData);
            return mockData;
        }
        console.log("Not found in public source.");
        return undefined;
    }
);

// Main Flow
const medicineDetailsFlow = ai.defineFlow(
    {
        name: 'medicineDetailsFlow',
        inputSchema: MedicineDetailsInputSchema,
        outputSchema: MedicineDetailsOutputSchema.optional(),
    },
    async ({ qrCode }) => {
        // Step 1: Try to get from Firestore
        let details = await getMedicineFromFirestore({ qrCode });
        if (details) {
            return { ...details, source: 'firestore' };
        }

        // Step 2: If not in Firestore, try public source
        details = await getMedicineFromPublicSource({ qrCode });
        if (details) {
            // Step 3: If found in public source, save it back to Firestore
            try {
                await setDoc(doc(db, 'medicines', qrCode), details, { merge: true });
                console.log(`Saved new medicine ${qrCode} to Firestore.`);
            } catch (error) {
                console.error("Error saving to Firestore:", error);
                // Continue anyway, but log the error
            }
            return { ...details, source: 'public_api' };
        }
        
        // If not found anywhere
        return undefined;
    }
);

// Exported function for the client
export async function getMedicineDetails(input: MedicineDetailsInput): Promise<MedicineDetailsOutput | undefined> {
    return medicineDetailsFlow(input);
}
