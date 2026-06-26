'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components';
import { Button } from '@/components';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl font-bold text-neon-purple mb-4">404</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Lost in the market
          </h1>
          <p className="text-gray-400 mb-6">
            This page doesn't exist. Time to chart a better course.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
            <Button
              onClick={() => router.back()}
              variant="secondary"
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
