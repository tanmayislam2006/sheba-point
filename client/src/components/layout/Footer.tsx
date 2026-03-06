import Link from "next/link";
import { HeartPulse, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                ShebaPoint
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs">
              Smart Healthcare Appointment & Prescription Platform. Making quality healthcare accessible for everyone, anywhere.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Patients</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/doctors" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Search Doctors
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Patient Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link href="/patient" className="text-base text-slate-500 hover:text-primary transition-colors">
                      My Appointments
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Doctors</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/doctor/register" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Join ShebaPoint
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Doctor Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/doctor" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/doctor/prescriptions" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Digital Prescriptions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Support</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/contact" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-base text-slate-500 hover:text-primary transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Legal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-base text-slate-500 hover:text-primary transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-base text-slate-400 xl:text-center">
            &copy; {new Date().getFullYear()} ShebaPoint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}