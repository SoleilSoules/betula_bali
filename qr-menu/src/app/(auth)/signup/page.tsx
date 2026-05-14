import Link from "next/link";
import { SignupForm } from "./form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Регистрация — QR-меню",
};

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать кабинет</CardTitle>
        <CardDescription>
          Бесплатно. Подключите ресторан и принимайте заказы через QR.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignupForm />
        <p className="text-sm text-muted-foreground text-center">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Войти
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
