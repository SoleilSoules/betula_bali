export function formatPrice(price: number, currency = "RUB") {
  if (currency === "RUB") return `${price.toLocaleString("ru-RU")} ₽`;
  return `${price} ${currency}`;
}
