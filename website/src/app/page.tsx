import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart3, TerminalSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50 -z-10" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-blue-50/50 rounded-l-full -z-10 transform translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            The Modern Point of Sale <br className="hidden md:block" />
            <span className="text-blue-600">Built for Speed and Scale</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Whizpoint POS streamlines your operations, manages inventory in real-time, and provides actionable insights. No cloud lock-in. Full offline support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-14 px-8 w-full sm:w-auto shadow-sm">
              Contact Sales
            </Link>
            <Link href="/docs" className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:text-slate-900 h-14 px-8 w-full sm:w-auto shadow-sm">
              Read Documentation <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200 aspect-[16/9] flex items-center justify-center text-slate-400">
                  {/* Replace with actual dashboard screenshot later if needed */}
                 <div className="text-center">
                   <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                   <p className="text-lg font-medium">Dashboard Preview</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to run your business
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Powerful features packed into a clean, intuitive interface that your staff will learn in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Lightning Fast Checkout</h3>
              <p className="text-slate-600">Optimized keyboard-first flows and fast barcode scanning. Keep the line moving, even during rush hour.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Offline-First Reliability</h3>
              <p className="text-slate-600">Never stop selling. Whizpoint works flawlessly without internet, syncing automatically when connection is restored.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Advanced Reporting</h3>
              <p className="text-slate-600">Detailed closing reports, inventory tracking, and M-Pesa integration analytics at your fingertips.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-300 mb-10">Trusted by modern businesses</h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-70">
            {/* Logos go here - using text placeholders for now */}
            <div className="text-2xl font-bold flex items-center gap-2"><TerminalSquare className="w-6 h-6"/> TechMart</div>
            <div className="text-2xl font-bold flex items-center gap-2"><TerminalSquare className="w-6 h-6"/> FreshGrocer</div>
            <div className="text-2xl font-bold flex items-center gap-2"><TerminalSquare className="w-6 h-6"/> QuickServe</div>
            <div className="text-2xl font-bold flex items-center gap-2"><TerminalSquare className="w-6 h-6"/> AutoParts</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to upgrade your checkout experience?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Get in touch with our sales team today to schedule a demo and see how Whizpoint POS can transform your operations.
            </p>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors bg-white text-blue-600 hover:bg-slate-50 h-14 px-8 shadow-sm">
              Contact Sales Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
