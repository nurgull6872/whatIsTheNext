import { Butterfly } from '../mascots';

export function Footer() {
  return (
    <footer className="border-t border-bark-200/60 py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 text-center">
        <Butterfly size={28} />
        <p className="text-sm text-bark-600">Karar veremediğinde kalabalığa sor.</p>
        <p className="text-xs text-bark-400">© {new Date().getFullYear()} What Is The Next?</p>
      </div>
    </footer>
  );
}
