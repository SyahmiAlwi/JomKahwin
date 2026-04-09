export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="w-full h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground font-medium">
        {current}/{total}
      </p>
    </div>
  );
}
