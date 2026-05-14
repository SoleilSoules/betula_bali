export function normalizePhone(phone: string | null | undefined) {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length >= 7 ? digits : null;
}

export function whatsappLink(
  phone: string | null | undefined,
  message: string,
): string | null {
  const p = normalizePhone(phone);
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}
