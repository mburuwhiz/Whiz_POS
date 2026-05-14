import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pos.whizpoint.app'),
  title: "Whizpoint POS - Modern Point of Sale System",
  description: "Whizpoint POS is a modern, high-performance point of sale system for retail and restaurants.",
  keywords: ["POS", "Point of Sale", "Retail POS", "Restaurant POS", "Whizpoint"],
  openGraph: {
    title: "Whizpoint POS - Modern Point of Sale System",
    description: "Whizpoint POS is a modern, high-performance point of sale system for retail and restaurants.",
    url: "https://pos.whizpoint.app",
    siteName: "Whizpoint POS",
    images: [
      {
        url: "/assets/logo.png",
        width: 800,
        height: 600,
        alt: "Whizpoint POS Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Whizpoint POS",
  "operatingSystem": "Any",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen bg-white text-slate-900 flex flex-col`}>
        <header className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/assets/logo.svg" alt="Whizpoint POS" width={32} height={32} />
              <span className="font-bold text-xl tracking-tight">Whizpoint</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <Link href="/#features" className="hover:text-slate-900 transition-colors">Features</Link>
              <Link href="/docs" className="hover:text-slate-900 transition-colors">Documentation</Link>
              <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact Sales</Link>
            </nav>
            <div className="flex items-center gap-4">
               <Link href="/contact" className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                Get Started
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Image src="/assets/logo.svg" alt="Whizpoint POS" width={24} height={24} className="grayscale opacity-50" />
              <span>&copy; {new Date().getFullYear()} Whizpoint Solutions. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="/docs" className="hover:text-slate-900">Documentation</Link>
              <Link href="/contact" className="hover:text-slate-900">Contact</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
