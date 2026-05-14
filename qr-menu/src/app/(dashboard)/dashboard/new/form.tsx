"use client";

import { useActionState, useState } from "react";
import { createRestaurantAction, type RestaurantFormState } from "@/app/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function suggestSlug(name: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
    ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  let out = "";
  for (const ch of name.toLowerCase()) {
    if (map[ch] !== undefined) out += map[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else if (/\s|-|_/.test(ch)) out += "-";
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export function CreateRestaurantForm() {
  const [state, action, pending] = useActionState<RestaurantFormState, FormData>(
    createRestaurantAction,
    undefined,
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugManuallyEdited) setSlug(suggestSlug(e.target.value));
          }}
          placeholder="Кафе «Полянка»"
        />
        {state?.fieldErrors?.name?.[0] && (
          <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Адрес меню</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/r/</span>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            placeholder="polyanka"
          />
        </div>
        {state?.fieldErrors?.slug?.[0] && (
          <p className="text-xs text-destructive">{state.fieldErrors.slug[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание (по желанию)</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Уютное место в центре. Авторская кухня и кофе на специальной обжарке."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Адрес заведения (по желанию)</Label>
        <Input id="address" name="address" placeholder="Москва, ул. Малая Полянка, 12" />
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Создаём…" : "Создать заведение"}
      </Button>
    </form>
  );
}
