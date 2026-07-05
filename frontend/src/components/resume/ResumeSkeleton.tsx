export default function ResumeSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 h-12 w-12 rounded-xl bg-slate-700" />

      <div className="h-5 w-2/3 rounded bg-slate-700" />

      <div className="mt-4 h-4 w-1/2 rounded bg-slate-800" />

      <div className="mt-8 h-8 w-24 rounded-full bg-slate-700" />
    </div>
  );
}