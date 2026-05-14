import { Toaster } from "@/components/ui/sonner";
import { requireUser } from "@/lib/access";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </>
  );
}
