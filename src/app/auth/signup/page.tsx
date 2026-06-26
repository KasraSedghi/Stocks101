'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks';
import { Button, Card, Input } from '@/components';
import {
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from '@/lib/password-strength';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    }

    if (!termsAccepted) {
      toast.error('You must accept the terms of service');
      valid = false;
    }

    return valid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signUp(email, password);

      if (error) {
        setEmailError(
          error.message.includes('already registered')
            ? 'Email is already registered'
            : error.message,
        );
        toast.error(error.message);
      } else {
        toast.success('Account created! Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 1500);
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
          <p className="text-gray-400 text-sm mt-1">Create your portfolio</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
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
            error={confirmError}
            required
          />

          <div className="flex items-start gap-3 py-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-dark-border bg-dark-surface border cursor-pointer accent-brand-purple"
            />
            <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
              I accept the{' '}
              <Link
                href="/terms"
                className="text-brand-purple hover:underline"
              >
                terms of service
              </Link>
              {' '}and{' '}
              <Link
                href="/privacy"
                className="text-brand-purple hover:underline"
              >
                privacy policy
              </Link>
            </label>
          </div>

          <Button
            variant="primary"
            fullWidth
            loading={loading}
            type="submit"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
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
