import { redirect } from "next/navigation";

// Demo deployment: корень показывает витрину Bali Betula напрямую.
// SaaS-лендинг временно отключён — он жил в этом файле раньше, можно
// откатить через git если потребуется (backup branch на origin).
export default function HomePage() {
  redirect("/r/demo");
}
