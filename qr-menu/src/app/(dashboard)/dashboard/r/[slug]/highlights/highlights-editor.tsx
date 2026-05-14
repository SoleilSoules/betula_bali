"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { InstagramIcon } from "@/components/brand-icons";
import { DishPhoto } from "@/components/dish-photo";
import {
  createHighlightAction,
  updateHighlightAction,
  deleteHighlightAction,
} from "@/app/actions/showcase";

type Item = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  instagramUrl: string | null;
};

export function HighlightsEditor({
  restaurantId,
  items,
}: {
  restaurantId: string;
  items: Item[];
}) {
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<null | { mode: "new" } | { mode: "edit"; item: Item }>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState<Item | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({ mode: "new" })}>
          <Plus className="h-4 w-4 mr-1" />
          Добавить блюдо
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          Пусто. Добавьте 3–4 главных блюда — они будут на витрине крупными карточками с
          переходом на ваш пост в Instagram.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((it) => (
            <Card key={it.id} className="p-4 flex gap-4">
              <DishPhoto src={it.photoUrl} alt={it.name} className="h-16 w-16 rounded-lg shrink-0" iconSize={20} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                {it.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {it.description}
                  </p>
                )}
                {it.instagramUrl && (
                  <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <InstagramIcon className="h-3 w-3" />
                    <span className="truncate">{it.instagramUrl}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditing({ mode: "edit", item: it })}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(it)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.mode === "edit" ? "Редактировать блюдо" : "Новое топ-блюдо"}
            </DialogTitle>
            <DialogDescription>
              Карточка ведёт гостя на ваш пост в Instagram — там фото, отзывы, видео.
            </DialogDescription>
          </DialogHeader>
          <form
            key={editing?.mode === "edit" ? editing.item.id : "new"}
            action={(fd) => {
              fd.set("restaurantId", restaurantId);
              startTransition(async () => {
                const isEdit = editing?.mode === "edit";
                if (isEdit) fd.set("id", editing.item.id);
                const action = isEdit ? updateHighlightAction : createHighlightAction;
                const res = await action(fd);
                if (res.ok) {
                  toast.success("Сохранено");
                  setEditing(null);
                } else {
                  const firstError =
                    res.fieldErrors && Object.values(res.fieldErrors).flat().filter(Boolean)[0];
                  toast.error(res.message ?? firstError ?? "Проверьте поля");
                }
              });
            }}
            className="space-y-3"
          >
            <Field name="name" label="Название" required defaultValue={editing?.mode === "edit" ? editing.item.name : ""} placeholder="Казан-кебаб" />
            <FieldTextarea name="description" label="Описание (по желанию)" defaultValue={editing?.mode === "edit" ? editing.item.description ?? "" : ""} placeholder="Из ягнятины, на углях" />
            <Field name="photoUrl" label="URL фото" defaultValue={editing?.mode === "edit" ? editing.item.photoUrl ?? "" : ""} placeholder="https://..." type="url" />
            <Field name="instagramUrl" label="Ссылка на пост в Instagram" defaultValue={editing?.mode === "edit" ? editing.item.instagramUrl ?? "" : ""} placeholder="https://www.instagram.com/p/..." type="url" />
            <DialogFooter className="mt-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Отмена</Button>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Убрать «{confirmDelete?.name}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Карточка пропадёт с витрины.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmDelete) return;
                const fd = new FormData();
                fd.set("id", confirmDelete.id);
                fd.set("restaurantId", restaurantId);
                startTransition(async () => {
                  const res = await deleteHighlightAction(fd);
                  if (res.ok) toast.success("Удалено");
                  else toast.error("Ошибка");
                });
                setConfirmDelete(null);
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  required,
  type,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </div>
  );
}

function FieldTextarea({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={2}
      />
    </div>
  );
}
