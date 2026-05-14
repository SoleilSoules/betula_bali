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
import { DishPhoto } from "@/components/dish-photo";
import {
  createOfferingAction,
  updateOfferingAction,
  deleteOfferingAction,
} from "@/app/actions/showcase";

type Item = {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  whatsappTopic: string | null;
};

export function OfferingsEditor({
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
          Добавить услугу
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          Например: «Аренда пуфика на кино», «Аренда стола на 6 человек», «Подарочный сертификат».
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((it) => (
            <Card key={it.id} className="p-4 flex gap-4">
              <DishPhoto src={it.photoUrl} alt={it.title} className="h-16 w-16 rounded-lg shrink-0" iconSize={20} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{it.title}</div>
                {it.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {it.description}
                  </p>
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
              {editing?.mode === "edit" ? "Редактировать услугу" : "Новая услуга"}
            </DialogTitle>
            <DialogDescription>
              Кнопка «Забронировать» откроет WhatsApp с готовой темой.
            </DialogDescription>
          </DialogHeader>
          <form
            key={editing?.mode === "edit" ? editing.item.id : "new"}
            action={(fd) => {
              fd.set("restaurantId", restaurantId);
              startTransition(async () => {
                const isEdit = editing?.mode === "edit";
                if (isEdit) fd.set("id", editing.item.id);
                const action = isEdit ? updateOfferingAction : createOfferingAction;
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
            <div className="space-y-1.5">
              <Label htmlFor="title">Название</Label>
              <Input id="title" name="title" required defaultValue={editing?.mode === "edit" ? editing.item.title : ""} placeholder="Аренда пуфика на кино" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Описание (по желанию)</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={editing?.mode === "edit" ? editing.item.description ?? "" : ""} placeholder="500₽ за пуфик. По записи." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photoUrl">URL фото</Label>
              <Input id="photoUrl" name="photoUrl" type="url" defaultValue={editing?.mode === "edit" ? editing.item.photoUrl ?? "" : ""} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsappTopic">Тема WhatsApp (по желанию)</Label>
              <Input id="whatsappTopic" name="whatsappTopic" defaultValue={editing?.mode === "edit" ? editing.item.whatsappTopic ?? "" : ""} placeholder="Хочу забронировать пуфик на кино" />
            </div>
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
            <AlertDialogTitle>Убрать «{confirmDelete?.title}»?</AlertDialogTitle>
            <AlertDialogDescription>Услуга пропадёт с витрины.</AlertDialogDescription>
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
                  const res = await deleteOfferingAction(fd);
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
