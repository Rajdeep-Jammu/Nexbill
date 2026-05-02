"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  FileText,
  BarChart3,
  Settings,
  UsersRound,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useAuthStore } from "@/hooks/use-auth-store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useUser, useAuth } from "@/firebase";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/inventory", icon: Boxes, label: "Inventory" },
  { href: "/admin/billing", icon: FileText, label: "Billing" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports" },
  { href: "/admin/roles", icon: UsersRound, label: "Admins" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { shopName } = useAuthStore();
  const { user } = useUser();

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-card/50 backdrop-blur-xl z-50">
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3 mb-10 group">
          <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <Logo className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter">NexBill</span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group",
                    active 
                      ? "bg-primary text-white shadow-xl shadow-primary/20" 
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-5 w-5", active ? "text-white" : "group-hover:text-primary")} />
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  {active && <ChevronRight className="h-4 w-4" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Managed Shop</p>
          <p className="font-black truncate text-sm">{shopName || "Our Shop"}</p>
        </div>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start rounded-2xl h-12 font-black text-destructive hover:bg-destructive/10 hover:text-destructive gap-3"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
