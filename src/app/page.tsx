import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ArrowRight, Bot, Syringe, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login/patient">Patient Login</Link>
            </Button>
            <Button asChild>
              <Link href="/login/pharmacist">Pharmacy Portal</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="relative py-24 md:py-32 lg:py-40">
          <div className="absolute inset-0">
            <Image
              src="https://picsum.photos/seed/medisys-hero/1920/1080"
              alt="A calm and modern healthcare setting"
              fill
              className="object-cover"
              data-ai-hint="medical professional"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
             <div className="absolute inset-0 bg-primary/20" />
          </div>
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-4 text-gray-800 drop-shadow-lg">
              Intelligent Health, Simplified.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-700/90 mb-8 drop-shadow">
              MediSys connects patients and pharmacies with a seamless, AI-enhanced platform. Manage your health with confidence and clarity.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/login/patient">
                  Access Patient Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login/pharmacist">
                  Enter Pharmacy Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">A Complete Health Ecosystem</h2>
              <p className="mt-4 text-lg text-muted-foreground">Everything you and your pharmacy need, all in one place.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Users className="h-8 w-8 text-blue-500" />}
                title="Patient-Centric Dashboard"
                description="View your appointments, prescriptions, and health data at a glance. Take control of your health journey."
              />
              <FeatureCard
                icon={<Syringe className="h-8 w-8 text-red-500" />}
                title="Pharmacy Operations Hub"
                description="Streamline prescription management, track inventory in real-time, and gain insights with sales reports."
              />
              <FeatureCard
                icon={<Bot className="h-8 w-8 text-green-500" />}
                title="AI Medication Guide"
                description="Understand your medication better. Check for potential interactions and side effects with our AI assistant."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MediSys. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 text-center items-center p-6">
       <div className="flex justify-center mb-4">{icon}</div>
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
