'use client';

import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import CustomerLayout from '../customer-layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Edit, User, ShieldCheck, Mail, Zap } from 'lucide-react';
import Link from 'next/link';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    toast({
      title: 'Logged Out',
      description: 'See you soon!',
    });
    router.push('/login');
  };

  if (!isClient || isUserLoading) {
    return (
      <CustomerLayout>
        <div className="flex h-[60vh] w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (!user) {
     return (
      <CustomerLayout>
        <PageHeader title="Settings" />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md text-center p-8 bg-card/50 backdrop-blur-lg border-white/10 card-3d rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 font-bold">
                You must be logged in to view your profile settings.
              </p>
              <Link href="/login">
                  <Button className="rounded-full px-8 py-6 font-black text-lg shadow-xl shadow-primary/20">Login Now</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <PageHeader title="Settings" />
      
      <div className="space-y-8 max-w-2xl mx-auto pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary via-indigo-600 to-violet-500 border-none text-white overflow-hidden relative rounded-[2.5rem] shadow-2xl card-3d">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="h-32 w-32 fill-white" />
            </div>
            <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 relative z-10">
              <div className="relative group">
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white/20 shadow-2xl">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                    <AvatarFallback className="text-3xl bg-white/10 text-white font-black">
                      {user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}
                    </AvatarFallback>
                </Avatar>
                <EditProfileDialog user={user}>
                  <Button size="icon" className="absolute -bottom-1 -right-1 rounded-full h-10 w-10 bg-white text-primary hover:bg-white/90 shadow-xl border-4 border-primary">
                    <Edit className="h-4 w-4" />
                  </Button>
                </EditProfileDialog>
              </div>
              <div className="text-center sm:text-left flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-2xl sm:text-4xl font-headline font-black tracking-tight">{user.displayName || 'Guest User'}</h2>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-2 py-0 font-bold self-center sm:self-auto">Member</Badge>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-white/80 font-bold">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm sm:text-lg">{user.email}</span>
                  </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:gap-6"
        >
          <Card className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-xl card-3d overflow-hidden group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  Account Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Full Name</p>
                      <p className="font-bold text-lg">{user.displayName || 'Not Set'}</p>
                    </div>
                    <EditProfileDialog user={user}>
                      <Button variant="ghost" size="sm" className="font-black text-primary hover:bg-primary/10">Edit</Button>
                    </EditProfileDialog>
                  </div>
              </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-xl card-3d overflow-hidden hover:border-emerald-500/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground font-bold">You are securely signed in via {user.providerData[0]?.providerId || 'password'}.</p>
                <div className="flex gap-2">
                   <Button onClick={handleLogout} variant="destructive" className="w-full rounded-2xl py-6 font-black text-base shadow-xl shadow-red-500/10">
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                  </Button>
                </div>
              </CardContent>
          </Card>
        </motion.div>
      </div>
    </CustomerLayout>
  );
}
