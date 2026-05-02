'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Email and password are required.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back to NexBill!',
      });
      router.replace('/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
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
      {/* Marketing Side (Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-primary to-emerald-900 p-20 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-white rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-400 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>
        
        <div className="relative z-10 space-y-8 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Logo className="h-16 w-16 mb-6" />
            <h2 className="text-6xl font-black font-headline tracking-tighter leading-none mb-4">
              Premium <span className="text-emerald-400">Inventory</span> System.
            </h2>
            <p className="text-xl font-bold opacity-80 leading-relaxed">
              Experience the next generation of billing and shop management. Designed for the modern era.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Zap, text: 'Real-time Sync' },
              { icon: ShieldCheck, text: 'Secure Payments' },
              { icon: Globe, text: 'Global Access' },
              { icon: ShieldCheck, text: 'Admin Controls' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10"
              >
                <feature.icon className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-sm">{feature.text}</span>
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
              Welcome Back
            </h1>
            <p className="text-muted-foreground font-bold mt-2">
              Sign in to manage your shop or view orders.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-14 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Login to Dashboard'}
            </Button>
          </form>

          <div className="pt-6 text-center lg:text-left text-sm text-muted-foreground font-bold">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-black">
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
