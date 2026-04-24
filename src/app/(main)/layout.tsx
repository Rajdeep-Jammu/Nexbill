"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Loader2 } from "lucide-react";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, initialized } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && initialized && !isLoggedIn) {
      router.replace("/");
    }
  }, [isClient, initialized, isLoggedIn, router]);

  if (!isClient || !initialized || !isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DesktopSidebar />
      <main className="flex-1 p-4 sm:p-6 md:ml-64">
        {children}
      </main>
      <MobileBottomNav />
      {/* Add padding to bottom of main content to avoid overlap with mobile nav */}
      <div className="h-24 md:hidden"></div>
    </div>
  );
}
