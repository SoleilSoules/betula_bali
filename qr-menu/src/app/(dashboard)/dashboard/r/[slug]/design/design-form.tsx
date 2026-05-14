"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { updateRestaurantDesignAction, type RestaurantFormState } from "@/app/actions/restaurant";

type Initial = {
  name: string;
  description: string;
  address: string;
  primaryColor: string;
  theme: "paper" | "warm" | "coastal" | "hideout" | "dark";
  logoUrl: string;
  telegramChatId: string;
  googleMapsUrl: string;
  instagramUrl: string;
  whatsappPhone: string;
  bookingMessage: string;
  mainMenuPdfUrl: string;
  specialMenuPdfUrl: string;
  isPublished: boolean;
};

const THEMES: { id: Initial["theme"]; title: string; hint: string; preview: string }[] = [
  { id: "paper", title: "Бумага", hint: "Кремовая, для пекарни/винной", preview: "bg-stone-100 text-stone-900 border-stone-300" },
  { id: "warm", title: "Тёплая", hint: "Янтарь, для кафе", preview: "bg-amber-50 text-amber-900 border-amber-200" },
  { id: "coastal", title: "Прибрежная", hint: "Песок + океан, для Bali/Sea", preview: "bg-stone-100 text-teal-900 border-stone-300" },
  { id: "hideout", title: "Hideout", hint: "Бордо + гжель, для этно-кухни", preview: "bg-stone-100 text-red-900 border-stone-300" },
  { id: "dark", title: "Тёмная", hint: "Графит, для бара/ресторана", preview: "bg-zinc-900 text-zinc-50 border-zinc-800" },
];

export function DesignForm({ slug, initial }: { slug: string; initial: Initial }) {
  const action = updateRestaurantDesignAction.bind(null, slug);
  const [state, formAction, pending] = useActionState<RestaurantFormState, FormData>(
    action,
    undefined,
  );
  const [theme, setTheme] = useState<Initial["theme"]>(initial.theme);
  const [color, setColor] = useState(initial.primaryColor);
  const [published, setPublished] = useState(initial.isPublished);

  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">О заведении</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field name="name" label="Название" required defaultValue={initial.name} fieldErrors={state?.fieldErrors?.name} />
          <FieldTextarea name="description" label="Описание" defaultValue={initial.description} />
          <Field name="address" label="Адрес" defaultValue={initial.address} placeholder="Москва, ул. Малая Полянка, 12" />
          <Field name="logoUrl" label="URL логотипа" type="url" defaultValue={initial.logoUrl} placeholder="https://..." hint="Квадратное фото — лучше всего." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Контакты и соцсети</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            name="googleMapsUrl"
            label="Ссылка на Google Maps"
            type="url"
            defaultValue={initial.googleMapsUrl}
            placeholder="https://maps.app.goo.gl/..."
            hint="В картах: «Поделиться» → «Скопировать ссылку». На витрине адрес станет кликабельным."
          />
          <Field
            name="instagramUrl"
            label="Instagram"
            type="url"
            defaultValue={initial.instagramUrl}
            placeholder="https://www.instagram.com/your_cafe"
            hint="Полная ссылка на профиль."
          />
          <Field
            name="whatsappPhone"
            label="WhatsApp-телефон для бронирований"
            defaultValue={initial.whatsappPhone}
            placeholder="+7 999 123-45-67"
            hint="С кодом страны. На него уйдут все нажатия «Забронировать», «Записаться», «Уточнить»."
          />
          <FieldTextarea
            name="bookingMessage"
            label="Стартовое сообщение брони"
            defaultValue={initial.bookingMessage}
            placeholder="Здравствуйте! Хочу забронировать стол на …"
            hint="Что увидит гость в WhatsApp при нажатии «Забронировать стол». Если пусто — будет «Здравствуйте! Хочу забронировать стол.»"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">PDF-меню</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            name="mainMenuPdfUrl"
            label="Основное меню (PDF)"
            type="url"
            defaultValue={initial.mainMenuPdfUrl}
            placeholder="https://drive.google.com/..."
            hint="Залейте PDF в Google Drive с общим доступом или Dropbox и вставьте сюда."
          />
          <Field
            name="specialMenuPdfUrl"
            label="Специальное меню (PDF)"
            type="url"
            defaultValue={initial.specialMenuPdfUrl}
            placeholder="https://drive.google.com/..."
            hint="Барная карта, кальяны, сезонное меню — что угодно второе."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Внешний вид</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <input type="hidden" name="theme" value={theme} />
          <div className="grid gap-3 md:grid-cols-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-all",
                  t.preview,
                  theme === t.id ? "ring-2 ring-foreground" : "hover:opacity-90",
                )}
              >
                <div className="font-medium">{t.title}</div>
                <div className="text-xs opacity-80 mt-1">{t.hint}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryColor">Главный цвет</Label>
            <div className="flex items-center gap-3">
              <input
                id="primaryColor"
                name="primaryColor"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-16 rounded-md border border-input bg-background"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="font-mono w-32"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <div className="ml-auto flex items-center gap-2 text-sm">
                <span>Кнопки:</span>
                <span
                  className="px-3 py-1 rounded-md text-white text-sm font-medium"
                  style={{ background: color }}
                >
                  Забронировать
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Уведомления и публикация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            name="telegramChatId"
            label="Telegram chat ID для заказов со столиков"
            defaultValue={initial.telegramChatId}
            placeholder="например, 123456789"
            hint="Уведомление о новом заказе из меню придёт в этот чат. Узнать chat ID — у бота @userinfobot."
          />

          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <div className="text-sm font-medium">Витрина опубликована</div>
              <div className="text-xs text-muted-foreground">
                Если выключить — гости увидят «Меню временно недоступно».
              </div>
            </div>
            <input type="hidden" name="isPublished" value={published ? "on" : ""} />
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type,
  defaultValue,
  placeholder,
  hint,
  required,
  fieldErrors,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  fieldErrors?: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {fieldErrors?.[0] && <p className="text-xs text-destructive">{fieldErrors[0]}</p>}
    </div>
  );
}

function FieldTextarea({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        rows={3}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
