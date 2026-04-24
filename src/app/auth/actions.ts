'use server';

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }

  try {
    const { auth } = initializeFirebase();
    await signInWithEmailAndPassword(auth, email, password);
    return { message: 'Success' };
  } catch (e: any) {
    return { message: e.message };
  }
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }
  if (password.length < 6) {
    return { message: 'Password must be at least 6 characters long.'}
  }

  try {
    const { auth } = initializeFirebase();
    await createUserWithEmailAndPassword(auth, email, password);
    return { message: 'Success' };
  } catch (e: any) {
    return { message: e.message };
  }
}

export async function logout() {
    try {
        const { auth } = initializeFirebase();
        await auth.signOut();
        return { message: 'Success' };
    } catch (e: any) {
        return { message: e.message };
    }
}
