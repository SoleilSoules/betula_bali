"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { InstagramIcon } from "@/components/brand-icons";
import {
  createInstagramPostAction,
  deleteInstagramPostAction,
} from "@/app/actions/showcase";

type Item = { id: string; url: string };

export function InstagramEditor({
  restaurantId,
  items,
}: {
  restaurantId: string;
  items: Item[];
}) {
  const [, startTransition] = useTransition();
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpenAdd(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Добавить пост
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          Откройте пост в Instagram, скопируйте ссылку и вставьте сюда.
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Card key={it.id} className="p-3 flex items-center gap-3">
              <InstagramIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-foreground hover:underline truncate flex-1"
              >
                {it.url}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const fd = new FormData();
                  fd.set("id", it.id);
                  fd.set("restaurantId", restaurantId);
                  startTransition(async () => {
                    const res = await deleteInstagramPostAction(fd);
                    if (res.ok) toast.success("Удалено");
                    else toast.error("Ошибка");
                  });
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый пост из Instagram</DialogTitle>
            <DialogDescription>
              Поддерживается публичный пост, reels или igtv. Storis нет.
            </DialogDescription>
          </DialogHeader>
          <form
            action={(fd) => {
              fd.set("restaurantId", restaurantId);
              startTransition(async () => {
                const res = await createInstagramPostAction(fd);
                if (res.ok) {
                  toast.success("Добавлен");
                  setOpenAdd(false);
                } else {
                  const firstError =
                    res.fieldErrors && Object.values(res.fieldErrors).flat().filter(Boolean)[0];
                  toast.error(res.message ?? firstError ?? "Проверьте ссылку");
                }
              });
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="ig-url">Ссылка</Label>
              <Input
                id="ig-url"
                name="url"
                required
                type="url"
                placeholder="https://www.instagram.com/p/Cabc.../"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpenAdd(false)}>Отмена</Button>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
