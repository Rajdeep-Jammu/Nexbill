
'use client';

import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';

import CustomerLayout from '../customer-layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ShoppingCart, ArrowRight, Zap, User as UserIcon } from 'lucide-react';
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

  const configRef = useMemoFirebase(() => doc(firestore, 'public', 'config'), [firestore]);
  const { data: config } = useDoc(configRef);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isClient, isUserLoading, user, router]);

  if (!isClient || isUserLoading || !user) {
    return (
      <CustomerLayout>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <PageHeader title="Me" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/shop" className="flex-1 sm:flex-initial">
            <Button className="w-full sm:w-auto rounded-2xl shadow-xl group gap-2 bg-primary hover:bg-primary/90 glow-primary font-black py-6 px-8">
              <ShoppingCart className="h-5 w-5" />
              Shop Now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <div className="lg:hidden">
            <ProfileDropdown />
          </div>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-10 pb-10">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Card className="bg-gradient-to-br from-indigo-600 via-primary to-emerald-500 border-none text-white overflow-hidden relative rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl card-3d">
                <div className="absolute -top-10 -right-10 p-8 opacity-10 animate-pulse">
                <Zap className="h-64 w-64 fill-white" />
                </div>
                <CardContent className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 p-10 sm:p-16 relative z-10 text-center sm:text-left">
                    <Avatar className="h-28 w-28 sm:h-40 sm:w-40 border-4 border-white/30 shadow-2xl ring-4 ring-white/10 ring-offset-4 ring-offset-primary">
                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                        <AvatarFallback className="text-4xl sm:text-6xl bg-white/10 text-white font-black">{user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 sm:space-y-4">
                        <h1 className="text-4xl sm:text-7xl font-headline font-black tracking-tighter">Hi, {user.displayName || user.email?.split('@')[0]}!</h1>
                        <p className="text-white/80 font-bold text-base sm:text-2xl">{user.email}</p>
                        <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-4 py-1.5 font-bold rounded-full">Member Since 2024</Badge>
                            <Badge className="bg-emerald-400 text-emerald-950 border-none px-4 py-1.5 font-black rounded-full shadow-lg">PREMIUM STATUS</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
            <Card className="rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-xl p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                        <UserIcon className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black">Welcome to your space</h2>
                    <p className="text-muted-foreground font-bold max-w-md">
                        This is your personal dashboard. You can update your settings, manage your profile, and explore our latest products in the shop.
                    </p>
                    <Link href="/settings">
                        <Button variant="outline" className="rounded-xl px-8 font-bold">Edit Profile Settings</Button>
                    </Link>
                </div>
            </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}
