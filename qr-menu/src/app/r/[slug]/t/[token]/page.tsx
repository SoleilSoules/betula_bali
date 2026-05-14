import { RestaurantMenu } from "../../_components/restaurant-menu";

export default async function PublicMenuWithTablePage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  return <RestaurantMenu slug={slug} tableToken={token} />;
}
