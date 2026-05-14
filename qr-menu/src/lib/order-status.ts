export const ORDER_STATUS_LABELS = {
  new: "Новый",
  in_progress: "Готовится",
  ready: "Готов",
  completed: "Закрыт",
  cancelled: "Отменён",
} as const;

export const ORDER_STATUS_TONE = {
  new: "default",
  in_progress: "secondary",
  ready: "secondary",
  completed: "outline",
  cancelled: "destructive",
} as const;

export const ORDER_STATUS_FLOW = ["new", "in_progress", "ready", "completed"] as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS_LABELS;
