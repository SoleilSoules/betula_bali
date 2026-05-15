import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const COOKIE_NAME = "qr_session";
const SESSION_TTL_DAYS = 30;

// AUTH_SECRET должен быть задан в продакшене для реальной авторизации.
// Допускаем hard-coded fallback, чтобы demo-деплой (Vercel preview) и
// build не падали из-за отсутствия env. Реальный AUTH_SECRET ставится
// в Vercel → Settings → Environment Variables.
let warnedMissingSecret = false;
function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (!warnedMissingSecret) {
      console.warn(
        "[auth] AUTH_SECRET не задан — используется fallback. Для прода поставь AUTH_SECRET в Vercel env vars.",
      );
      warnedMissingSecret = true;
    }
    return new TextEncoder().encode(
      "betula-demo-fallback-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId === "string" && typeof payload.email === "string") {
      return { userId: payload.userId, email: payload.email } satisfies SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({ where: { id: session.userId } });
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
