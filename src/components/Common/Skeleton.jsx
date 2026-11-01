import React from "react";

// Pulsing placeholder block shown while data loads
export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-ink/[0.07] ${className}`} aria-hidden="true" />
);

export const ShelfSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10" role="status" aria-label="Loading shelf">
    <Skeleton className="h-10 w-64 sm:h-12" />
    <Skeleton className="mt-3 h-5 w-48" />
    <div className="mt-8 grid max-w-lg grid-cols-3 gap-2 sm:gap-4">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
    <Skeleton className="mt-8 h-11 w-full rounded-full" />
    <Skeleton className="mt-3 h-10 w-full rounded-full sm:w-96" />
    <div className="mt-10 rounded-3xl bg-ink/[0.04] p-6 sm:p-10">
      <Skeleton className="mx-auto h-10 w-56" />
      <div className="mt-10 flex gap-4 sm:gap-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-[2/3] w-[6.5rem] shrink-0 sm:w-36" />
        ))}
      </div>
    </div>
  </div>
);

export const BookSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10" role="status" aria-label="Loading book">
    <div className="grid gap-8 md:grid-cols-[240px_1fr] md:gap-10">
      <Skeleton className="aspect-[2/3] w-28 md:w-full" />
      <div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="mt-3 h-6 w-1/3" />
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="mt-10 h-40 w-full" />
      </div>
    </div>
  </div>
);
