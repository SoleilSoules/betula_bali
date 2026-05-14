import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import {
  ArrowRight,
  QrCode,
  Sparkles,
  CalendarDays,
  Sofa,
  MessageCircle,
  FileText,
  ShoppingBag,
} from "lucide-react";
import { InstagramIcon } from "@/components/brand-icons";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <header className="px-6 py-5 max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="font-semibold tracking-tight text-lg">QR-меню</div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Войти</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Создать кабинет</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Вся информация о заведении —<br />
            <span className="text-foreground/60">по одному QR-коду.</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            Меню, бронь стола, события, аренда пуфика, инста-фид. Гость сканит со столика —
            и сразу всё перед ним. Бронирование уходит в WhatsApp, заказ со столика — в Telegram.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">
                Сделать витрину
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/r/demo">
              <Button size="lg" variant="outline">
                Открыть демо
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/20">
          <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-4">
            <Feature
              icon={<MessageCircle className="h-5 w-5" />}
              title="Бронь и записи в WhatsApp"
              text="Гость нажимает «Забронировать» — открывается WhatsApp с готовой темой. Никаких форм и регистраций."
            />
            <Feature
              icon={<CalendarDays className="h-5 w-5" />}
              title="События и кинопоказы"
              text="Расскажите про 3–4 ближайших события. Каждое — с кнопкой «Записаться»."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Топ-блюда → Instagram"
              text="Карточки главных блюд ведут на ваши посты в инсте — фото, отзывы, рилсы."
            />
            <Feature
              icon={<Sofa className="h-5 w-5" />}
              title="Аренда и услуги"
              text="«Аренда пуфика на кино», «Подарочный сертификат», «Стол на 8 человек» — всё с кнопкой WhatsApp."
            />
            <Feature
              icon={<FileText className="h-5 w-5" />}
              title="Меню в PDF"
              text="Загрузите PDF-меню и спецменю в Google Drive — поставьте ссылки. Гость скачает мгновенно."
            />
            <Feature
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Заказ со столика — опционально"
              text="Хотите ещё интерактивный заказ с корзиной? Подключите столики и блюда — заказ упадёт в Telegram."
            />
            <Feature
              icon={<InstagramIcon className="h-5 w-5" />}
              title="Лента из Instagram"
              text="Вставьте 4–8 ссылок на лучшие посты — встроятся прямо в витрину."
            />
            <Feature
              icon={<QrCode className="h-5 w-5" />}
              title="QR на печать"
              text="Сгенерируйте QR со ссылкой на витрину — на стол, на стойку, в инсте, на флаере."
            />
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Один раз настроили — годами работает
          </h2>
          <p className="text-muted-foreground mt-4">
            Без агрегаторов, без комиссий, без подписки в первой итерации. Сделано для
            небольших заведений, которым важно не потерять гостя на этапе «как у вас
            забронировать».
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg">
                Попробовать бесплатно
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-4 text-sm text-muted-foreground text-center">
        Сделано на Next.js. Открытый код, ваши данные у вас.
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
      <div className="rounded-lg bg-foreground/5 p-2 text-foreground shrink-0">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
