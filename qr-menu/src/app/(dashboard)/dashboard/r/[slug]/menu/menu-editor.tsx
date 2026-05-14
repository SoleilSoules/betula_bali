"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, FolderPlus, EyeOff, Eye } from "lucide-react";
import {
  createCategoryAction,
  renameCategoryAction,
  deleteCategoryAction,
  createDishAction,
  updateDishAction,
  toggleDishAvailabilityAction,
  deleteDishAction,
} from "@/app/actions/menu";
import { formatPrice } from "@/lib/format";
import { DishPhoto } from "@/components/dish-photo";

type Dish = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  isAvailable: boolean;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
  dishes: Dish[];
};

export function MenuEditor({
  restaurantId,
  currency,
  categories,
}: {
  restaurantId: string;
  currency: string;
  categories: Category[];
}) {
  const [, startTransition] = useTransition();
  const [categoryDialog, setCategoryDialog] = useState<
    null | { mode: "create" } | { mode: "rename"; id: string; name: string }
  >(null);
  const [dishDialog, setDishDialog] = useState<
    null | { mode: "create"; categoryId: string } | { mode: "edit"; dish: Dish }
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<
    | null
    | { kind: "category"; id: string; name: string }
    | { kind: "dish"; id: string; name: string }
  >(null);

  function runAction(action: (fd: FormData) => Promise<{ ok: boolean; message?: string }>, fd: FormData, success: string) {
    startTransition(async () => {
      const res = await action(fd);
      if (res?.ok) toast.success(success);
      else toast.error(res?.message ?? "Не получилось. Попробуйте ещё раз.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setCategoryDialog({ mode: "create" })}>
          <FolderPlus className="h-4 w-4 mr-1" />
          Добавить категорию
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Пока нет ни одной категории. Создайте первую — например, «Завтраки» или «Напитки».
          </p>
        </Card>
      ) : (
        categories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
              <div className="font-medium">{cat.name}</div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategoryDialog({ mode: "rename", id: cat.id, name: cat.name })}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete({ kind: "category", id: cat.id, name: cat.name })}
                  disabled={cat.dishes.length > 0}
                  title={cat.dishes.length > 0 ? "Сначала удалите блюда из категории" : ""}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="divide-y">
              {cat.dishes.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  В этой категории пока нет блюд.
                </div>
              ) : (
                cat.dishes.map((d) => (
                  <div key={d.id} className="px-5 py-3 flex items-center gap-4">
                    <DishPhoto src={d.photoUrl} alt={d.name} className="h-12 w-12 rounded-md" iconSize={16} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={d.isAvailable ? "font-medium" : "font-medium text-muted-foreground line-through"}>
                          {d.name}
                        </span>
                      </div>
                      {d.description && (
                        <p className="text-xs text-muted-foreground truncate">{d.description}</p>
                      )}
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {formatPrice(d.price, currency)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title={d.isAvailable ? "Скрыть" : "Показать"}
                        onClick={() => {
                          const fd = new FormData();
                          fd.set("id", d.id);
                          fd.set("restaurantId", restaurantId);
                          runAction(toggleDishAvailabilityAction, fd, d.isAvailable ? "Скрыто" : "Показано");
                        }}
                      >
                        {d.isAvailable ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDishDialog({ mode: "edit", dish: d })}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete({ kind: "dish", id: d.id, name: d.name })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t bg-muted/10">
              <Button variant="ghost" size="sm" onClick={() => setDishDialog({ mode: "create", categoryId: cat.id })}>
                <Plus className="h-4 w-4 mr-1" />
                Добавить блюдо
              </Button>
            </div>
          </Card>
        ))
      )}

      <CategoryDialog
        state={categoryDialog}
        onClose={() => setCategoryDialog(null)}
        restaurantId={restaurantId}
      />

      <DishDialog
        state={dishDialog}
        onClose={() => setDishDialog(null)}
        restaurantId={restaurantId}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Удалить {confirmDelete?.kind === "category" ? "категорию" : "блюдо"} «{confirmDelete?.name}»?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
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
                if (confirmDelete.kind === "category") {
                  runAction(deleteCategoryAction, fd, "Категория удалена");
                } else {
                  runAction(deleteDishAction, fd, "Блюдо удалено");
                }
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

function CategoryDialog({
  state,
  onClose,
  restaurantId,
}: {
  state: null | { mode: "create" } | { mode: "rename"; id: string; name: string };
  onClose: () => void;
  restaurantId: string;
}) {
  const [pending, startTransition] = useTransition();
  const isOpen = !!state;
  const initialName = state?.mode === "rename" ? state.name : "";

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {state?.mode === "rename" ? "Переименовать категорию" : "Новая категория"}
          </DialogTitle>
          <DialogDescription>
            Название гость увидит в меню. Например: «Горячее», «Кофе», «Десерты».
          </DialogDescription>
        </DialogHeader>
        <form
          key={state?.mode === "rename" ? state.id : "new"}
          action={(fd) => {
            fd.set("restaurantId", restaurantId);
            startTransition(async () => {
              if (state?.mode === "rename") {
                fd.set("id", state.id);
                const res = await renameCategoryAction(fd);
                if (res.ok) {
                  toast.success("Сохранено");
                  onClose();
                } else toast.error(res.message ?? "Ошибка");
              } else {
                const res = await createCategoryAction(fd);
                if (res.ok) {
                  toast.success("Категория создана");
                  onClose();
                } else toast.error(res.message ?? "Ошибка");
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="cat-name">Название</Label>
            <Input id="cat-name" name="name" defaultValue={initialName} required maxLength={60} />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохраняем…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DishDialog({
  state,
  onClose,
  restaurantId,
  categories,
}: {
  state: null | { mode: "create"; categoryId: string } | { mode: "edit"; dish: Dish };
  onClose: () => void;
  restaurantId: string;
  categories: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const isOpen = !!state;
  const initialDish = state?.mode === "edit" ? state.dish : null;
  const initialCategoryId =
    state?.mode === "edit"
      ? state.dish.categoryId
      : state?.mode === "create"
      ? state.categoryId
      : "";

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialDish ? "Редактировать блюдо" : "Новое блюдо"}
          </DialogTitle>
          <DialogDescription>
            Название, описание, цена и фото. Можно скрыть на время.
          </DialogDescription>
        </DialogHeader>
        <form
          key={initialDish?.id ?? "new"}
          action={(fd) => {
            fd.set("restaurantId", restaurantId);
            if (!fd.get("categoryId")) fd.set("categoryId", initialCategoryId);
            startTransition(async () => {
              const action = initialDish ? updateDishAction : createDishAction;
              if (initialDish) fd.set("id", initialDish.id);
              const res = await action(fd);
              if (res.ok) {
                toast.success(initialDish ? "Сохранено" : "Блюдо добавлено");
                onClose();
              } else {
                const firstError =
                  res.fieldErrors && Object.values(res.fieldErrors).flat().filter(Boolean)[0];
                toast.error(res.message ?? firstError ?? "Проверьте поля");
              }
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label htmlFor="d-name">Название</Label>
            <Input id="d-name" name="name" required defaultValue={initialDish?.name ?? ""} maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="d-price">Цена, ₽</Label>
              <Input id="d-price" name="price" required type="number" min={0} step={1} defaultValue={initialDish?.price ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-cat">Категория</Label>
              <Select name="categoryId" defaultValue={initialCategoryId}>
                <SelectTrigger id="d-cat">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-desc">Описание (по желанию)</Label>
            <Textarea id="d-desc" name="description" rows={2} defaultValue={initialDish?.description ?? ""} maxLength={400} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-photo">URL фото (по желанию)</Label>
            <Input id="d-photo" name="photoUrl" type="url" defaultValue={initialDish?.photoUrl ?? ""} placeholder="https://..." />
            <p className="text-xs text-muted-foreground">
              Можно вставить ссылку на картинку. Загрузка файлов появится позже.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <div className="text-sm font-medium">Показывать гостям</div>
              <div className="text-xs text-muted-foreground">Скрытое блюдо не появится в меню</div>
            </div>
            <Switch name="isAvailable" defaultChecked={initialDish?.isAvailable ?? true} />
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохраняем…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
