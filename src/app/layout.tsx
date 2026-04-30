'use client';

import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { useThemeStore } from '@/hooks/use-theme-store';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update HTML class when theme changes
  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  return (
    <html lang="en" className={mounted ? theme : ''}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
        <title>NexBill</title>
        <meta name="description" content="A modern, premium inventory and billing system." />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}