import { RestaurantMenu } from "./r/[slug]/_components/restaurant-menu";

// Корневая страница / показывает демо-витрину Bali Betula напрямую,
// чтобы Vercel preview сразу открывался на лендинге, а не на
// маркетинг-странице SaaS. Прежняя marketing-версия с CTA «Создать
// кабинет» сохранена в git history — откатить можно одним revert.
export const metadata = {
  title: "Bali Betula — Social Hideout & Eatery",
  description:
    "Pererenan, Bali — русско-балийская кухня, бронь стола и события одним QR.",
};

export default async function HomePage() {
  return <RestaurantMenu slug="demo" tableToken={null} />;
}
