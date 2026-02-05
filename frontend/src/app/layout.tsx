import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Dashboard | Real-time Stock Tracking',
  description: 'Track your investment portfolio with live market data from NSE/BSE. Monitor CMP, gains/losses, sector allocation, and more.',
  keywords: ['portfolio', 'stocks', 'NSE', 'BSE', 'investment', 'dashboard', 'fintech'],
  authors: [{ name: 'Portfolio Dashboard' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl fintech-gradient flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Portfolio</h1>
                  <p className="text-xs text-slate-500 -mt-0.5">Dashboard</p>
                </div>
              </div>
              
              {/* Market status indicator */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-success-500 pulse-live" />
                <span className="text-slate-600">NSE/BSE</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
              <p>
                Built with Next.js, TypeScript, and Tailwind CSS
              </p>
              <p>
                Data sourced from Yahoo Finance & Google Finance
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
