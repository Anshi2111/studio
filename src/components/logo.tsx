import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M75,25 A25,25 0 0,1 50,50 A25,25 0 0,1 25,25"
            fill="none"
            stroke="#2196F3"
            strokeWidth="10"
          />
          <path
            d="M85,50 C85,30 65,15 50,15 C35,15 15,30 15,50 C15,60 20,75 35,85 C45,90 60,90 70,85 C85,75 85,60 85,50 Z"
            fill="currentColor"
          />
          <path
            d="M50,35 C40,25 30,40 50,55 C70,40 60,25 50,35 Z"
            fill="#64B5F6"
          />
           <path 
            d="M 50,45 C 45,40 40,50 50,60 C 60,50 55,40 50,45 Z"
            fill="#2196F3"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold font-headline text-[#1A3D7C]">
        Healthure
      </span>
    </div>
  );
}

export function Logo_s({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M75,25 A25,25 0 0,1 50,50 A25,25 0 0,1 25,25"
            fill="none"
            stroke="#2196F3"
            strokeWidth="10"
          />
          <path
            d="M85,50 C85,30 65,15 50,15 C35,15 15,30 15,50 C15,60 20,75 35,85 C45,90 60,90 70,85 C85,75 85,60 85,50 Z"
            fill="#0D47A1"
          />
          <path
            d="M50,35 C40,25 30,40 50,55 C70,40 60,25 50,35 Z"
            fill="#64B5F6"
          />
           <path 
            d="M 50,45 C 45,40 40,50 50,60 C 60,50 55,40 50,45 Z"
            fill="#2196F3"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold font-headline text-[#1A3D7C]">
        Healthure
      </span>
    </div>
  );
}
