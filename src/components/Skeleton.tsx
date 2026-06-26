'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva('bg-dark-surface animate-pulse rounded-md', {
  variants: {
    variant: {
      line: 'h-4 w-full',
      circle: 'h-12 w-12 rounded-full',
      card: 'h-32 w-full',
      chart: 'h-64 w-full',
    },
  },
  defaultVariants: {
    variant: 'line',
  },
});

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export function Skeleton({ variant, className, ...props }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ variant }), className)} {...props} />;
}
