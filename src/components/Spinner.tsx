export function Spinner({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${
        light ? 'border-white/60' : 'border-brand-400'
      }`}
    />
  );
}
