export function ChainSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-[20px] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton h-4 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-4/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
