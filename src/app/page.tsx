import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ArrowRight, BarChart, HeartPulse, ShieldCheck, Stethoscope, Pill } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-lg font-medium text-slate-800">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/patient/dashboard" className="hover:text-primary transition-colors">Patient Dashboard</Link>
            <Link href="/pharmacy/dashboard" className="hover:text-primary transition-colors">Pharmacy Dashboard</Link>
            <Link href="#about" className="hover:text-primary transition-colors">About Us</Link>
          </nav>
          <Button asChild>
            <Link href="#contact">Contact</Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="relative py-28 md:py-36 lg:py-48 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 items-center gap-12">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#1A3D7C] tracking-tight mb-6">
                Medicine Safety, Made Simple.
              </h1>
              <p className="max-w-xl mx-auto md:mx-0 text-lg md:text-xl text-slate-600 mb-10">
                Your integrated health partner for seamless patient and pharmacy management. Experience the future of healthcare, today.
              </p>
              <Button size="lg" className="bg-[#1ABC9C] hover:bg-[#16a085] text-white" asChild>
                <Link href="/patient/dashboard">
                  Explore Patient Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative h-64 md:h-full flex items-center justify-center">
               <Image src="https://storage.googleapis.com/studiostoragetest/stable-1721935542846/user/2a688b02-5c02-4632-a5ab-5419352e6900/1722005477983" alt="Healthcare professionals and patients" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="healthcare professional patient" />
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-28 bg-[#F5F5F5]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A3D7C]">Why Choose Healthure?</h2>
              <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Discover the powerful features that make health management intuitive and efficient.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Stethoscope className="h-10 w-10 text-[#4A90E2]" />}
                title="Smart Diagnostics"
                description="Leverage AI to understand symptoms and get initial guidance."
              />
              <FeatureCard
                icon={<Pill className="h-10 w-10 text-[#1ABC9C]" />}
                title="Medication Insights"
                description="Scan barcodes to get instant, clear information about your medications."
              />
              <FeatureCard
                icon={<BarChart className="h-10 w-10 text-[#F5A623]" />}
                title="Health Dashboards"
                description="Visualize your health journey with intuitive charts for patients and pharmacies."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-10 w-10 text-[#D0021B]" />}
                title="Secure & Compliant"
                description="Your data is protected with the highest standards of security and privacy."
              />
            </div>
          </div>
        </section>

        <section id="patient-dashboard" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div className="pr-8">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A3D7C]">Your Personal Health Hub</h2>
              <p className="mt-4 text-lg text-slate-500 mb-6">Manage appointments, view prescriptions, and track your health progress—all in one place. The patient dashboard puts you in control.</p>
              <Button variant="outline" asChild>
                <Link href="/patient/dashboard">
                  Go to Patient Dashboard
                </Link>
              </Button>
            </div>
            <Card className="shadow-xl rounded-xl overflow-hidden">
                <Image src="https://storage.googleapis.com/studiostoragetest/stable-1721935542846/user/2a688b02-5c02-4632-a5ab-5419352e6900/1722005477983" alt="Patient dashboard preview" width={800} height={600} className="w-full" data-ai-hint="dashboard chart" />
            </Card>
          </div>
        </section>

        <section id="pharmacy-dashboard" className="py-20 md:py-28 bg-[#F5F5F5]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <Card className="shadow-xl rounded-xl overflow-hidden order-last md:order-first">
                 <Image src="https://storage.googleapis.com/studiostoragetest/stable-1721935542846/user/2a688b02-5c02-4632-a5ab-5419352e6900/1722005477983" alt="Pharmacy dashboard preview" width={800} height={600} className="w-full" data-ai-hint="pharmacy interior" />
            </Card>
            <div className="pl-8 order-first md:order-last">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A3D7C]">Streamline Your Pharmacy</h2>
              <p className="mt-4 text-lg text-slate-500 mb-6">Efficiently manage prescriptions, track inventory with real-time alerts, and analyze sales data to grow your business. </p>
              <Button variant="outline" asChild>
                <Link href="/pharmacy/dashboard">
                  Go to Pharmacy Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 md:py-28 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1A3D7C]">About Healthure</h2>
                    <p className="mt-4 text-lg text-slate-500">At Healthure, we believe that managing your health should be simple, transparent, and empowering. Our mission is to bridge the gap between patients and pharmacies through innovative technology. We are a team of healthcare professionals, developers, and designers dedicated to creating a healthier future for everyone.</p>
                </div>
                 <div className="relative h-64 md:h-80">
                    <Image src="https://picsum.photos/seed/doctor-friendly/600/400" alt="Friendly doctor illustration" layout="fill" objectFit="contain" data-ai-hint="friendly doctor" />
                </div>
            </div>
        </section>
      </main>

      <footer id="contact" className="bg-[#1A3D7C] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                    <h3 className="font-bold text-lg mb-2">Quick Links</h3>
                    <ul>
                        <li><Link href="#features" className="hover:underline">Features</Link></li>
                        <li><Link href="/login/patient" className="hover:underline">Patient Login</Link></li>
                        <li><Link href="/login/pharmacist" className="hover:underline">Pharmacy Login</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2">Follow Us</h3>
                    {/* Social Icons would go here */}
                    <p>Stay connected on social media.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2">Healthure</h3>
                    <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center items-center p-8 bg-white rounded-xl">
       <div className="flex justify-center mb-5">{icon}</div>
      <CardHeader className="p-0">
        <CardTitle className="font-bold text-xl text-[#1A3D7C]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-3">
        <p className="text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}
