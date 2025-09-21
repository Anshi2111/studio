'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/medication-interaction-guide.ts';
import '@/ai/flows/qrcode-medication-info.ts';
import '@/ai/flows/get-medication-expiry-date.ts';
