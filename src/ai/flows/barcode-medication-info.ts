'use server';
/**
 * @fileOverview An AI agent that provides medication information based on a barcode.
 *
 * - getMedicationInfoFromBarcode - A function that takes a data URI of a barcode image and returns medication info.
 * - BarcodeMedicationInfoInput - The input type for the getMedicationInfoFromBarcode function.
 * - BarcodeMedicationInfoOutput - The return type for the getMedicationInfoFromBarcode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

const BarcodeMedicationInfoInputSchema = z.object({
  barcodeImage: z
    .string()
    .describe(
      "A photo of a medication's barcode, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BarcodeMedicationInfoInput = z.infer<typeof BarcodeMedicationInfoInputSchema>;

const BarcodeMedicationInfoOutputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  summary: z.string().describe('A brief summary of the medication, including its purpose, common dosage, and key warnings.'),
  audioSummary: z.string().optional().describe('A data URI of a WAV audio file containing the summary text.'),
});
export type BarcodeMedicationInfoOutput = z.infer<typeof BarcodeMedicationInfoOutputSchema>;

export async function getMedicationInfoFromBarcode(input: BarcodeMedicationInfoInput): Promise<BarcodeMedicationInfoOutput> {
  return barcodeMedicationInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'barcodeMedicationInfoPrompt',
  input: {schema: BarcodeMedicationInfoInputSchema},
  output: {schema: z.object({
    medicationName: z.string().describe('The name of the medication.'),
    summary: z.string().describe('A brief summary of the medication, including its purpose, common dosage, and key warnings.'),
  })},
  prompt: `You are a helpful pharmacy assistant. A user has provided an image of a medication's barcode. 
  
  1. Analyze the barcode in the image to identify the medication.
  2. Provide the medication's brand or generic name.
  3. Provide a concise summary covering its primary use, typical dosage instructions, and any critical warnings or common side effects.

  The user is relying on you for accurate, easy-to-understand information.

  Barcode Image: {{media url=barcodeImage}}`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const barcodeMedicationInfoFlow = ai.defineFlow(
  {
    name: 'barcodeMedicationInfoFlow',
    inputSchema: BarcodeMedicationInfoInputSchema,
    outputSchema: BarcodeMedicationInfoOutputSchema,
  },
  async input => {
    const {output: textOutput} = await prompt(input);
    if (!textOutput) {
      throw new Error('Could not retrieve medication information.');
    }

    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: textOutput.summary,
      });

      if (!media) {
        return {
            ...textOutput,
            audioSummary: undefined,
        }
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      const wavBase64 = await toWav(audioBuffer);

    return {
      ...textOutput,
      audioSummary: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
