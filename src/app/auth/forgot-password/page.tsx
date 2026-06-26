'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks';
import { Button, Card, Input } from '@/components';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    setError('');

    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        setError(resetError.message);
        toast.error('Failed to send reset email');
      } else {
        setSubmitted(true);
        toast.success('Reset email sent! Check your inbox.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl opacity-20"></div>
        </div>

        <Card className="w-full max-w-md text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-3">
              <span className="text-2xl">✓</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-gray-400 mb-6">
            We've sent a password reset link to <span className="text-white">{email}</span>. Click the link in your email to reset your password.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The link will expire in 24 hours.
          </p>
          <Link href="/auth/login">
            <Button variant="secondary" fullWidth>
              Back to Login
            </Button>
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            className="text-sm text-brand-purple hover:underline mt-3"
          >
            Try another email
          </button>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-gray-400 text-sm mt-1">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button
            variant="primary"
            fullWidth
            loading={loading}
            type="submit"
          >
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="text-brand-purple hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
