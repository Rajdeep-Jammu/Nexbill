'use client';

import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';

import CustomerLayout from '../customer-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ShoppingCart, ArrowRight, Zap, Star, ShieldCheck, Crown, Gift, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ProfileDropdown } from '@/components/customer/ProfileDropdown';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isClient, isUserLoading, user, router]);

  if (!isClient || isUserLoading || isProfileLoading || !user) {
    return (
      <CustomerLayout>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  const statCards = [
    {
      title: "Member Status",
      value: userProfile?.isVerified ? "Verified" : "Standard",
      icon: <ShieldCheck className="h-6 w-6" />,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      delay: 0.1
    },
    {
      title: "NexPoint Balance",
      value: (userProfile?.points || 0).toLocaleString(),
      icon: <Star className="h-6 w-6" />,
      color: "bg-amber-500",
      textColor: "text-amber-500",
      delay: 0.2
    },
    {
      title: "Account Tier",
      value: userProfile?.tier || "Classic",
      icon: <Crown className="h-6 w-6" />,
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
      delay: 0.3
    },
    {
      title: "Special Rewards",
      value: "Coming Soon",
      icon: <Gift className="h-6 w-6" />,
      color: "bg-rose-500",
      textColor: "text-rose-500",
      delay: 0.4
    }
  ];

  return (
    <CustomerLayout>
      <div className="flex flex-col gap-8 pb-20">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
             <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <LayoutDashboard className="h-6 w-6" />
             </div>
             <div>
                <h1 className="text-3xl font-headline font-black tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground font-bold text-sm hidden sm:block">Welcome to your personal member portal.</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
              <Link href="/shop" className="hidden sm:block">
                <Button className="rounded-2xl shadow-xl group gap-2 bg-primary hover:bg-primary/90 glow-primary font-black py-6 px-8">
                  <ShoppingCart className="h-5 w-5" />
                  Shop Store
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <div className="lg:hidden">
                <ProfileDropdown />
              </div>
          </div>
        </div>

        <div className="space-y-12">
          <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
          >
              <Card className="bg-gradient-to-br from-indigo-700 via-primary to-emerald-600 border-none text-white overflow-hidden relative rounded-[3rem] shadow-2xl card-3d">
                  <div className="absolute -top-10 -right-10 p-8 opacity-10 animate-pulse">
                  <Zap className="h-64 w-64 fill-white" />
                  </div>
                  <CardContent className="flex flex-col sm:flex-row items-center gap-6 sm:gap-16 p-10 sm:p-20 relative z-10 text-center sm:text-left">
                      <Avatar className="h-32 w-32 sm:h-56 sm:w-56 border-8 border-white/20 shadow-2xl ring-4 ring-white/10 ring-offset-8 ring-offset-primary">
                          {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                          <AvatarFallback className="text-5xl sm:text-8xl bg-white/10 text-white font-black">{user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-4 sm:space-y-6">
                          <div className="space-y-1">
                            <h2 className="text-5xl sm:text-8xl font-headline font-black tracking-tighter leading-none">Hi, {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}!</h2>
                            <p className="text-white/80 font-bold text-xl sm:text-3xl">{user.email}</p>
                          </div>
                          <div className="pt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
                              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-6 py-2.5 text-sm font-black rounded-full">EST. 2024</Badge>
                              {userProfile?.tier === 'Premium' && (
                                  <Badge className="bg-emerald-400 text-emerald-950 border-none px-6 py-2.5 text-sm font-black rounded-full shadow-lg">PREMIUM ACCESS</Badge>
                              )}
                              <Badge className="bg-indigo-900/50 text-white border-none px-6 py-2.5 text-sm font-black rounded-full backdrop-blur-lg">LEVEL {Math.floor((userProfile?.points || 0) / 100) + 1}</Badge>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {statCards.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, type: 'spring' }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="h-full"
              >
                <Card className="h-full rounded-[2.5rem] border-border/50 bg-card/50 backdrop-blur-xl card-3d overflow-hidden group">
                  <CardContent className="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
                    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center ${stat.color} text-white shadow-xl shadow-${stat.color.split('-')[1]}-500/30 group-hover:rotate-12 transition-all`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{stat.title}</p>
                      <h3 className={`text-2xl sm:text-3xl font-black ${stat.textColor}`}>{stat.value}</h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="rounded-[3.5rem] border-none bg-secondary/30 backdrop-blur-xl p-10 sm:p-20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 text-primary rotate-12">
                  <ShoppingCart className="h-64 w-64" />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="text-center sm:text-left space-y-4">
                      <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">Ready for more?</h2>
                      <p className="text-muted-foreground font-bold text-lg sm:text-2xl max-w-xl">
                        Explore our latest premium arrivals and exclusive drops tailored specifically for you.
                      </p>
                    </div>
                    <Link href="/shop" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto rounded-3xl py-10 px-14 font-black text-2xl shadow-2xl bg-primary hover:bg-primary/90 glow-primary transition-all hover:scale-110 active:scale-95">
                          Open Shop
                          <ArrowRight className="ml-3 h-8 w-8" />
                        </Button>
                    </Link>
                </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </CustomerLayout>
  );
}
