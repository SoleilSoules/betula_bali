"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { LoginSchema, SignupSchema } from "@/lib/validators";

export type AuthFormState =
  | {
      ok?: false;
      fieldErrors?: Record<string, string[] | undefined>;
      message?: string;
    }
  | undefined;

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    return { ok: false, message: "Пользователь с таким email уже зарегистрирован" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name || null,
    },
  });

  await createSession({ userId: user.id, email: user.email });
  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return { ok: false, message: "Неверный email или пароль" };
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { ok: false, message: "Неверный email или пароль" };
  }

  await createSession({ userId: user.id, email: user.email });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
