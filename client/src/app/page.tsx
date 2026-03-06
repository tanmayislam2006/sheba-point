import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DoctorCard, type Doctor } from "@/components/shared/DoctorCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, CheckCircle2, Video, ShieldCheck, Stethoscope, Activity, Star } from "lucide-react";

const mockDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 128,
    experience: 15,
    fee: 150,
    location: "New York, NY",
    availability: "Available Today",
  },
  {
    id: "d2",
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    rating: 4.8,
    reviews: 94,
    experience: 12,
    fee: 200,
    location: "San Francisco, CA",
    availability: "Next Avail: Tomorrow",
  },
  {
    id: "d3",
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatologist",
    rating: 4.7,
    reviews: 215,
    experience: 8,
    fee: 120,
    location: "Chicago, IL",
    availability: "Available Today",
  },
  {
    id: "d4",
    name: "Dr. James Wilson",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 340,
    experience: 20,
    fee: 100,
    location: "Austin, TX",
    availability: "Next Avail: Mon",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role="public" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-slate-50 pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-primary/5 rounded-l-full blur-3xl opacity-50 -z-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              <div className="md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6 border border-secondary/20">
                    <Activity className="h-4 w-4" />
                    <span>Smart Healthcare</span>
                  </div>
                  <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-slate-900 sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                    Find and book the <span className="text-primary">best doctors</span> near you.
                  </h1>
                  <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Instantly book appointments with top-rated doctors. Access digital prescriptions, video consultations, and seamless healthcare management from anywhere.
                  </p>
                  <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="h-14 px-8 text-base shadow-lg shadow-primary/25" asChild>
                      <Link href="/doctors">
                        Book Appointment <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base border-slate-300 text-slate-700 bg-white" asChild>
                      <Link href="/register">Register as Patient</Link>
                    </Button>
                  </div>

                  <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                         <div className="h-8 w-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-700">A</div>
                         <div className="h-8 w-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs font-medium text-green-700">M</div>
                         <div className="h-8 w-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs font-medium text-purple-700">R</div>
                         <div className="h-8 w-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-xs font-medium text-amber-700">+</div>
                      </div>
                      <span><strong>10k+</strong> Happy Patients</span>
                    </div>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span><strong>4.9/5</strong> App Rating</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
                <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-2xl sm:overflow-hidden p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 relative">
                  <div className="absolute top-4 right-4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 z-10 animate-bounce delay-150">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                         <CheckCircle2 className="h-6 w-6 text-secondary" />
                       </div>
                       <div>
                         <p className="text-xs text-slate-500 font-medium">Appointment Confirmed</p>
                         <p className="text-sm font-bold text-slate-900">Today, 10:00 AM</p>
                       </div>
                     </div>
                  </div>
                  <img
                    className="w-full rounded-xl object-cover"
                    src="https://images.unsplash.com/photo-1576091160550-2173ff9e5eb8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Doctor consulting with patient"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need for better healthcare
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Online Booking", desc: "Book appointments instantly without calling the clinic.", icon: Stethoscope },
                { title: "Video Consultation", desc: "Consult with top doctors from the comfort of your home.", icon: Video },
                { title: "Digital Prescriptions", desc: "Access and download your prescriptions anytime.", icon: Activity },
                { title: "Secure Payments", desc: "Pay seamlessly online with our secure Stripe integration.", icon: ShieldCheck },
              ].map((feature, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Doctor Showcase */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Top Rated Doctors</h2>
                <p className="mt-4 text-lg text-slate-500">Book appointments with highly qualified and experienced medical professionals.</p>
              </div>
              <Button variant="outline" className="hidden sm:flex text-primary border-primary/20 hover:bg-primary/5" asChild>
                <Link href="/doctors">View All Doctors <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                <Link href="/doctors">View All Doctors</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">How ShebaPoint Works</h2>
              <p className="mt-4 text-lg text-slate-500">Four simple steps to get the medical care you need.</p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100" aria-hidden="true" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                {[
                  { step: "01", title: "Search Doctor", desc: "Find a doctor by specialty, location, or availability." },
                  { step: "02", title: "Book Appointment", desc: "Choose a suitable time slot and consultation type." },
                  { step: "03", title: "Pay Online", desc: "Complete payment securely to confirm your booking." },
                  { step: "04", title: "Get Care", desc: "Consult doctor and receive digital prescriptions." },
                ].map((item, i) => (
                  <div key={i} className="relative text-center">
                    <div className="w-24 h-24 mx-auto bg-white border-4 border-slate-50 rounded-full flex items-center justify-center shadow-sm relative z-10 mb-6">
                      <span className="text-2xl font-bold text-primary">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}