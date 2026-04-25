'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Admin = {
  uid: string;
  role: 'ADMIN';
  email?: string;
};

export default function RolesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [targetUid, setTargetUid] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'admins'));
  }, [firestore]);

  const { data: admins, isLoading, error } = useCollection<Admin>(adminsQuery);

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUid) {
      toast({ variant: 'destructive', title: 'Error', description: 'User UID is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const adminRef = doc(firestore, 'admins', targetUid);
      await setDoc(adminRef, {
        uid: targetUid,
        role: 'ADMIN',
        email: targetEmail || '',
      });
      toast({ title: 'Success', description: `User ${targetUid} is now an admin.` });
      setTargetUid('');
      setTargetEmail('');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message || 'You may not have permission to perform this action.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Manage Admins" />
        <div className="flex h-[60vh] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50">
          <div className="text-center">
            <p className="text-xl font-bold text-destructive">Permission Denied</p>
            <p className="text-muted-foreground">You do not have permission to view or manage admins.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Manage Admins" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle>Current Admins</CardTitle>
              <CardDescription>
                {isLoading ? 'Loading...' : `There are ${admins?.length || 0} admins.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                 <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                 </div>
              ) : (
                <ul className="space-y-2">
                  {admins?.map(admin => (
                    <li key={admin.uid} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-semibold">{admin.email || 'No Email Provided'}</p>
                        <p className="font-mono text-xs text-muted-foreground">{admin.uid}</p>
                      </div>
                      <span className="text-sm font-bold text-primary px-3 py-1 rounded-full bg-primary/10">{admin.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle>Grant Admin Role</CardTitle>
              <CardDescription>Enter a user's UID to make them an admin.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMakeAdmin} className="space-y-4">
                <Input
                  name="uid"
                  placeholder="User UID"
                  required
                  value={targetUid}
                  onChange={(e) => setTargetUid(e.target.value)}
                  className="font-mono"
                />
                <Input
                  name="email"
                  placeholder="User Email (for display)"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Make Admin'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
