# Healthure - Medicine Safety, Made Simple

Healthure is an integrated health partner platform designed for seamless patient and pharmacy management. It leverages AI to provide medication guidance and streamlines pharmacy operations.

## Features

### For Patients
- **Smart Dashboard**: Personalized greetings and upcoming appointment overviews.
- **AI Medication Guide**: Check for potential drug interactions and scan QR codes for instant medication information with AI-generated audio summaries.
- **Medicine Cabinet**: Manage a list of purchased and manually added medications with automated expiry tracking.
- **Medical Records**: A secure timeline for tracking diagnoses, prescriptions, and doctor visits.
- **Reminders**: Automated alerts for upcoming dosages and expiring medications.

### For Pharmacists
- **Pharmacy Dashboard**: Real-time revenue tracking, low stock alerts, and prescription status management.
- **Inventory Management**: Scan QR codes to quickly add medicines to stock or manage them manually.
- **Record Sales**: Link medication sales to patient accounts via phone number/email for automated safety tracking.
- **Sales History**: Comprehensive transaction logs for reporting and analysis.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI Components**: ShadCN UI, Tailwind CSS, Lucide Icons
- **Generative AI**: Google Genkit (Gemini 2.5 Flash for text analysis and TTS)
- **Database/Auth**: Firebase Firestore & Authentication (using client-side SDK)
- **Barcode/QR Scanning**: html5-qrcode for reliable camera-based scanning

## Getting Started

1. **Patient Login**: Access the patient portal at `/login/patient`. Use any mock email/password to explore the dashboard.
2. **Pharmacist Login**: Access the pharmacy portal at `/login/pharmacist`.
3. **AI Guide**: Navigate to the Medication Guide to scan medications or check drug interactions.

---
Built with Firebase Studio.
