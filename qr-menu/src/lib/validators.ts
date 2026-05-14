import { z } from "zod";

const optionalString = (max = 500) =>
  z.string().max(max).optional().or(z.literal(""));

const optionalUrl = (max = 500) =>
  z
    .string()
    .max(max)
    .refine((s) => s === "" || /^https?:\/\//i.test(s), "Должно начинаться с http:// или https://")
    .optional()
    .or(z.literal(""));

const optionalPhone = z
  .string()
  .max(20)
  .regex(/^[+0-9 \-()]*$/, "Только цифры, +, пробелы, -, ()")
  .optional()
  .or(z.literal(""));

export const SignupSchema = z.object({
  name: z.string().min(2, "Имя минимум 2 символа").max(60).trim().optional().or(z.literal("")),
  email: z.string().email("Введите корректный email").trim().toLowerCase(),
  password: z.string().min(6, "Пароль минимум 6 символов").max(100),
});

export const LoginSchema = z.object({
  email: z.string().email("Введите корректный email").trim().toLowerCase(),
  password: z.string().min(1, "Введите пароль"),
});

export const RestaurantSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  description: optionalString(500),
  address: optionalString(200),
});

export const RestaurantDesignSchema = z.object({
  name: z.string().min(2).max(80),
  description: optionalString(500),
  address: optionalString(200),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Цвет в формате #RRGGBB"),
  theme: z.enum(["paper", "warm", "coastal", "hideout", "dark"]),
  logoUrl: optionalUrl(500),
  telegramChatId: z.string().max(40).optional().or(z.literal("")),
  googleMapsUrl: optionalUrl(500),
  instagramUrl: optionalUrl(500),
  whatsappPhone: optionalPhone,
  bookingMessage: optionalString(300),
  mainMenuPdfUrl: optionalUrl(500),
  specialMenuPdfUrl: optionalUrl(500),
  isPublished: z.boolean(),
});

export const CategorySchema = z.object({
  name: z.string().min(1, "Введите название").max(60),
});

export const DishSchema = z.object({
  categoryId: z.string().min(1, "Выберите категорию"),
  name: z.string().min(1, "Введите название").max(120),
  description: optionalString(400),
  price: z.coerce.number().int().min(0).max(1_000_000),
  photoUrl: optionalUrl(500),
  isAvailable: z.boolean(),
});

export const TableSchema = z.object({
  label: z.string().min(1, "Введите название").max(40),
});

export const OrderItemSchema = z.object({
  dishId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const PlaceOrderSchema = z.object({
  restaurantSlug: z.string().min(1),
  tableToken: z.string().optional(),
  customerName: optionalString(80),
  customerPhone: optionalString(40),
  note: optionalString(300),
  items: z.array(OrderItemSchema).min(1, "Корзина пуста"),
});

export const OrderStatusSchema = z.enum([
  "new",
  "in_progress",
  "ready",
  "completed",
  "cancelled",
]);

export const HighlightSchema = z.object({
  name: z.string().min(1, "Введите название").max(120),
  description: optionalString(400),
  photoUrl: optionalUrl(500),
  instagramUrl: optionalUrl(500),
});

export const EventSchema = z.object({
  title: z.string().min(1, "Введите название").max(120),
  description: optionalString(400),
  whenText: z.string().min(1, "Когда событие? напр.: 12 мая, 19:00").max(80),
  photoUrl: optionalUrl(500),
  whatsappTopic: optionalString(120),
});

export const OfferingSchema = z.object({
  title: z.string().min(1, "Введите название").max(120),
  description: optionalString(400),
  photoUrl: optionalUrl(500),
  whatsappTopic: optionalString(120),
});

export const InstagramPostSchema = z.object({
  url: z
    .string()
    .min(1, "Вставьте ссылку на пост")
    .max(500)
    .regex(/instagram\.com\/(p|reel|tv)\//i, "Это не похоже на ссылку на пост Instagram"),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
