import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <div className="w-8 h-8 bg-[#4A90E2] rounded-full flex items-center justify-center">
            <Plus className="h-5 w-5 text-white" />
       </div>
      <span className="text-2xl font-bold font-headline text-[#1A3D7C]">
        MediSys
      </span>
    </div>
  );
}
