"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading, isAdmin } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (isAdmin) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/profile");
      }
    }
  }, [isAdmin, isUserLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
