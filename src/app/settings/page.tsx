'use client';

import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

import CustomerLayout from '../customer-layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';

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
      description: 'You have been successfully logged out.',
    });
    router.push('/');
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
    // Should be redirected by layout, but as a fallback:
     return (
      <CustomerLayout>
        <PageHeader title="Settings" />
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md text-center p-8 bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                You must be logged in to view this page.
              </p>
              <Link href="/login">
                  <Button>Login</Button>
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
      <div className="space-y-8 max-w-2xl mx-auto">
        <Card className="bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                        <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{user.displayName || 'No display name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

         <Card className="bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>Manage your session.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button onClick={handleLogout} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
