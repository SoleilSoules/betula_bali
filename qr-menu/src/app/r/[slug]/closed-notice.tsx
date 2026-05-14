import { themeStyle } from "@/lib/theme";

export function ClosedNotice({
  name,
  themeId,
  primary,
}: {
  name: string;
  themeId: string;
  primary: string;
}) {
  return (
    <main
      style={themeStyle(themeId, primary)}
      className="min-h-svh flex items-center justify-center p-8"
    >
      <div className="bg-[var(--qr-surface)] text-[var(--qr-text)] rounded-2xl border border-[var(--qr-border)] shadow-sm p-10 max-w-md text-center">
        <div className="text-2xl font-semibold mb-2">{name}</div>
        <p className="text-[var(--qr-muted)]">
          Меню временно недоступно. Загляните чуть позже.
        </p>
      </div>
    </main>
  );
}
