'use client';

import { useEffect } from 'react';
import { Card } from '@/components';
import { Button } from '@/components';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle size={48} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-400 mb-6">
            We encountered an unexpected error. Our team has been notified.
          </p>
          {error.message && (
            <p className="text-xs text-gray-500 mb-6 font-mono break-words">
              {error.message}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button onClick={() => reset()} className="w-full">
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="secondary"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
