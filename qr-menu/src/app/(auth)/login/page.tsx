import Link from "next/link";
import { LoginForm } from "./form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Вход — QR-меню",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Вход в кабинет</CardTitle>
        <CardDescription>
          Войдите, чтобы настроить меню и принимать заказы.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <p className="text-sm text-muted-foreground text-center">
          Нет аккаунта?{" "}
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
