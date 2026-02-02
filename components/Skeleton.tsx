import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Generic block placeholder for loading states. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded bg-white/10", className)}
      aria-hidden="true"
    />
  );
}

/** Lobby scenario card–shaped skeleton (icon, title, lines, difficulty dots, button). */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-lg p-6 flex flex-col gap-4 animate-pulse",
        className
      )}
      aria-hidden="true"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-white/10 mx-auto" />
      <div className="h-5 bg-white/10 rounded w-3/4 mx-auto" />
      <div className="h-4 bg-white/10 rounded w-full" />
      <div className="h-4 bg-white/10 rounded w-1/2 mx-auto" />
      <div className="flex justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/10" />
        <div className="w-2 h-2 rounded-full bg-white/10" />
        <div className="w-2 h-2 rounded-full bg-white/10" />
      </div>
      <div className="h-10 bg-white/10 rounded mt-auto" />
    </div>
  );
}
