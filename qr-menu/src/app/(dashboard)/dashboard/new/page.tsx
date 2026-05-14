import Link from "next/link";
import { CreateRestaurantForm } from "./form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Новое заведение — QR-меню" };

export default function NewRestaurantPage() {
  return (
    <div className="min-h-svh bg-muted/30">
      <header className="px-6 py-5 border-b bg-background">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Назад
            </Button>
          </Link>
          <div className="font-semibold tracking-tight">Новое заведение</div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Расскажите о заведении</CardTitle>
            <CardDescription>
              Эти поля гость увидит на странице меню. Слаг — короткий адрес ссылки.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateRestaurantForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
