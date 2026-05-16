import { BETULA } from "@/lib/betula-data";
import { RestaurantMenu } from "./_components/restaurant-menu";

export const metadata = {
  title: `${BETULA.name} — menu`,
  description: BETULA.description,
};

export default function PublicMenuPage() {
  return <RestaurantMenu slug={BETULA.slug} tableToken={null} />;
}
