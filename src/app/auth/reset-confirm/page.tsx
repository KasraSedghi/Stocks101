'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks';
import { Button, Card, Input } from '@/components';
import {
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from '@/lib/password-strength';

function ResetConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    const accessToken = searchParams.get('code');
    if (accessToken) {
      setToken(accessToken);
    } else {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [searchParams]);

  const validateForm = () => {
    setError('');

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        setError(updateError.message);
        toast.error('Failed to update password');
      } else {
        setSuccess(true);
        toast.success('Password updated successfully!');
        setTimeout(() => router.push('/auth/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <h1 className="text-2xl font-bold text-white mb-2">Password Reset</h1>
          <p className="text-gray-400 mb-6">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" fullWidth>
              Sign In
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl opacity-20"></div>
        </div>

        <Card className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
            <p className="text-gray-400 mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/auth/forgot-password">
              <Button variant="primary" fullWidth>
                Request New Link
              </Button>
            </Link>
          </div>
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
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-gray-400 text-sm mt-1">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-neon-red/10 border border-neon-red rounded-md">
              <p className="text-sm text-neon-red">{error}</p>
            </div>
          )}

          <div>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-400">Password strength</p>
                  <p
                    className="text-xs font-medium"
                    style={{ color: getPasswordStrengthColor(passwordStrength) }}
                  >
                    {getPasswordStrengthLabel(passwordStrength)}
                  </p>
                </div>
                <div className="h-1 bg-dark-surface rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width:
                        passwordStrength === 'weak'
                          ? '33%'
                          : passwordStrength === 'fair'
                            ? '66%'
                            : '100%',
                      backgroundColor: getPasswordStrengthColor(passwordStrength),
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            variant="primary"
            fullWidth
            loading={loading}
            type="submit"
          >
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Know your password?{' '}
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

export default function ResetConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-base flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <ResetConfirmContent />
    </Suspense>
  );
}
