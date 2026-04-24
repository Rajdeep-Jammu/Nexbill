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

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-card/30 border-r border-border p-4">
      <div className="flex items-center gap-2 mb-10 px-2">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-2xl font-bold text-foreground">
          Momentum
        </h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10",
              pathname === item.href && "bg-primary/10 text-primary font-semibold"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 p-2">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${shopName}`} />
            <AvatarFallback>{getInitials(shopName || 'S')}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground truncate">{shopName}</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
