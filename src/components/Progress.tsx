import { forwardRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@zougui/react.ui';

export const Progress = forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, color, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    {...props}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
      className,
    )}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (Math.min(100, value ?? 0))}%)`, backgroundColor: color }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  color?: string;
}
