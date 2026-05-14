import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/30 flex flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          QR-меню
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
