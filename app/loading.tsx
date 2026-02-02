import { SkeletonCard } from "@/components/Skeleton";

/** Route-level loading UI: shows while the page is loading (e.g. initial client hydration). */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 pt-24">
      <div
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 py-4"
        aria-live="polite"
        aria-busy="true"
      >
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
