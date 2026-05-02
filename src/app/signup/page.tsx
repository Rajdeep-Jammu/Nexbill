'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Email and password are required.',
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL || `https://avatar.vercel.sh/${user.email}.png`,
        points: 0,
        tier: 'Classic',
        isVerified: false,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Account Created',
        description: "Welcome to the NexBill family!",
      });
      router.replace('/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Marketing Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-primary to-emerald-900 p-20 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-white rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>
        
        <div className="relative z-10 space-y-12 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Logo className="h-20 w-20 mb-10" />
            <h2 className="text-7xl font-black font-headline tracking-tighter leading-none mb-6">
              Join the <br/><span className="text-emerald-400">Future</span> of Retail.
            </h2>
            <p className="text-2xl font-bold opacity-80 leading-relaxed">
              One account for everything. Shop effortlessly or manage your business with enterprise-grade tools.
            </p>
          </motion.div>
          
          <div className="space-y-6">
             {[
               { icon: Sparkles, title: "Modern Experience", desc: "Designed for high-speed interactions." },
               { icon: Zap, title: "Instant Setup", desc: "Get your shop live in under 5 minutes." },
               { icon: ShieldCheck, title: "End-to-End Security", desc: "Your data and transactions are always protected." }
             ].map((item, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-4"
                >
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
                        <item.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-black text-xl">{item.title}</h4>
                        <p className="font-bold text-white/60">{item.desc}</p>
                    </div>
                </motion.div>
             ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <Logo className="h-12 w-12 text-primary lg:hidden mb-4" />
            <h1 className="text-4xl font-headline font-black tracking-tight text-foreground">
              Create Account
            </h1>
            <p className="text-muted-foreground font-bold mt-2">
              Start your journey with NexBill today.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="pt-2">
                <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-14 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Join the Network'}
                </Button>
            </div>
          </form>

          <div className="text-center lg:text-left text-sm text-muted-foreground font-bold">
            By signing up, you agree to our Terms and Conditions.
          </div>

          <div className="pt-4 text-center lg:text-left text-sm text-muted-foreground font-bold">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-black">
              Sign in here
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
