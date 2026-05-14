"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Plus, Download, Trash2, RefreshCw, Copy, Check } from "lucide-react";
import {
  createTableAction,
  deleteTableAction,
  regenerateTableTokenAction,
} from "@/app/actions/tables";

type Item = {
  id: string;
  label: string;
  url: string;
  qrDataUrl: string;
};

export function TablesEditor({
  restaurantId,
  tables,
}: {
  restaurantId: string;
  tables: Item[];
}) {
  const [, startTransition] = useTransition();
  const [openCreate, setOpenCreate] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Item | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(url: string, id: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    });
  }

  function download(item: Item) {
    const a = document.createElement("a");
    a.href = item.qrDataUrl;
    a.download = `qr-${item.label.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Добавить столик
        </Button>
      </div>

      {tables.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Столиков пока нет. Добавьте первый — например, «Стол 1» или «Терраса 3».
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <div className="bg-white p-6 flex items-center justify-center border-b">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.qrDataUrl} alt={t.label} className="h-44 w-44" />
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="font-medium">{t.label}</div>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 truncate w-full text-left"
                  onClick={() => copy(t.url, t.id)}
                  title={t.url}
                >
                  {copiedId === t.id ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span className="truncate">{t.url}</span>
                </button>
                <div className="flex items-center gap-1 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => download(t)}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    PNG
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Перегенерировать"
                    onClick={() => {
                      const fd = new FormData();
                      fd.set("id", t.id);
                      fd.set("restaurantId", restaurantId);
                      startTransition(async () => {
                        const res = await regenerateTableTokenAction(fd);
                        if (res.ok) toast.success("QR обновлён. Старая ссылка перестала работать.");
                        else toast.error("Не получилось");
                      });
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Удалить"
                    onClick={() => setConfirmDelete(t)}
                    className="ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый столик</DialogTitle>
            <DialogDescription>
              Название гостям не показывается — нужно вам, чтобы понимать, куда нести.
            </DialogDescription>
          </DialogHeader>
          <form
            action={(fd) => {
              fd.set("restaurantId", restaurantId);
              setPendingCreate(true);
              startTransition(async () => {
                const res = await createTableAction(fd);
                setPendingCreate(false);
                if (res.ok) {
                  toast.success("Столик создан");
                  setOpenCreate(false);
                } else toast.error(res.message ?? "Ошибка");
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="t-label">Название</Label>
              <Input id="t-label" name="label" required maxLength={40} placeholder="Стол 5" />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={pendingCreate}>
                {pendingCreate ? "Создаём…" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Удалить столик «{confirmDelete?.label}»?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Старый QR перестанет работать. Заказы, привязанные к столу, останутся в истории.
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
                  const res = await deleteTableAction(fd);
                  if (res.ok) toast.success("Столик удалён");
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
