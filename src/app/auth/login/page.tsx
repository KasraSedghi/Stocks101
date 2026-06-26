'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks';
import { Button, Card, Input } from '@/components';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill email if remember me was checked before
  useEffect(() => {
    const savedEmail = localStorage.getItem('shadowvest_email');
    const wasSaved = localStorage.getItem('shadowvest_remember_me') === 'true';
    if (savedEmail && wasSaved) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validateForm = () => {
    setError('');

    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error: authError } = await signIn(email, password, rememberMe);

      if (authError) {
        setError('Invalid email or password');
        toast.error('Login failed. Please check your credentials.');
      } else {
        toast.success('Login successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl opacity-20"></div>
      </div>

      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-purple rounded-lg mb-3">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">ShadowVest</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your portfolio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-neon-red/10 border border-neon-red rounded-md">
              <p className="text-sm text-neon-red">{error}</p>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-dark-border bg-dark-surface border cursor-pointer accent-brand-purple"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-brand-purple hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            variant="primary"
            fullWidth
            loading={loading}
            type="submit"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-brand-purple hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
