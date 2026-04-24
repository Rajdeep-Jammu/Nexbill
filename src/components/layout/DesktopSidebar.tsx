"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuthStore } from "@/hooks/use-auth-store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: Boxes, label: "Inventory" },
  { href: "/billing", icon: FileText, label: "Billing" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { shopName, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return null;
}
