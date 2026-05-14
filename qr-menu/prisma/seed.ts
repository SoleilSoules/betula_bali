import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const db = new PrismaClient({ adapter });

// Local photos copied from ~/Desktop/bali-betula-photos/ into public.
const p = (name: string) => `/photos/bali-betula/${name}.jpg`;

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await db.user.upsert({
    where: { email: "demo@qr-menu.local" },
    update: {},
    create: {
      email: "demo@qr-menu.local",
      passwordHash,
      name: "Bali Betula host",
    },
  });

  const existing = await db.restaurant.findUnique({ where: { slug: "demo" } });
  if (existing) {
    await db.restaurant.delete({ where: { id: existing.id } });
    console.log("Старый демо-ресторан удалён, пересоздаю.");
  }

  const restaurant = await db.restaurant.create({
    data: {
      slug: "demo",
      name: "Bali Betula",
      description:
        "Social Hideout & Eatery in Pererenan. Hand-rolled dumplings, slow-cooked stews, the Indian Ocean around the corner. Good food · good people · good vibes.",
      address: "Jl. Raya Kesambi, Kerobokan, Bali 80361",
      primaryColor: "#7d3a4c",
      theme: "hideout",
      currency: "IDR",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bali+Betula+Kerobokan",
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
      whatsappPhone: "+6282144556677",
      bookingMessage: "Hi Betula! I'd like to book a table for ...",
      mainMenuPdfUrl: null,
      specialMenuPdfUrl: null,
      logoUrl: p("logo-bowl"),
      ownerId: owner.id,
    },
  });

  const categories = await Promise.all(
    [
      { name: "Mains", sort: 0 },
      { name: "Soups", sort: 1 },
      { name: "Starters", sort: 2 },
      { name: "Sweets", sort: 3 },
      { name: "Drinks", sort: 4 },
    ].map((c) =>
      db.category.create({
        data: { ...c, restaurantId: restaurant.id },
      }),
    ),
  );

  // Prices in IDR thousands × 1000 = real IDR.
  const dishes: {
    categoryIdx: number;
    name: string;
    description?: string;
    price: number;
    photoUrl?: string;
  }[] = [
    { categoryIdx: 0, name: "Beshbarmak", description: "Hand-cut noodles, slow-braised beef, broth", price: 145000, photoUrl: p("beshbarmak-rice") },
    { categoryIdx: 0, name: "Manty", description: "Hand-folded dumplings — beef + onion", price: 95000, photoUrl: p("manti") },
    { categoryIdx: 0, name: "Cast-iron stew", description: "Potato, beef, slow-cooked vegetables", price: 130000, photoUrl: p("stew-plate") },
    { categoryIdx: 0, name: "Pelmeni", description: "Pork + beef, served with sour cream", price: 88000, photoUrl: p("dumplings") },
    { categoryIdx: 1, name: "Borscht", description: "With garlic pampushki on the side", price: 78000, photoUrl: p("borsch") },
    { categoryIdx: 1, name: "Solyanka", description: "Hearty meat soup, lemon and capers", price: 92000, photoUrl: p("warm-soup") },
    { categoryIdx: 2, name: "Cheburek", description: "Thin pastry, juicy beef filling", price: 55000, photoUrl: p("cheburek") },
    { categoryIdx: 2, name: "Garden salad", description: "Seasonal vegetables, yogurt dressing", price: 68000, photoUrl: p("salad-stack") },
    { categoryIdx: 3, name: "Syrniki", description: "Cottage cheese pancakes, condensed milk", price: 72000, photoUrl: p("syrniki") },
    { categoryIdx: 4, name: "Berry kompot", description: "Sea buckthorn, raspberry, blackcurrant", price: 38000, photoUrl: p("kompot-glass") },
  ];

  await Promise.all(
    dishes.map((d, i) =>
      db.dish.create({
        data: {
          name: d.name,
          description: d.description,
          price: d.price,
          photoUrl: d.photoUrl ?? null,
          sort: i,
          categoryId: categories[d.categoryIdx]!.id,
          restaurantId: restaurant.id,
        },
      }),
    ),
  );

  await Promise.all(
    Array.from({ length: 6 }).map((_, i) =>
      db.table.create({
        data: {
          label: `${i + 1}`,
          restaurantId: restaurant.id,
        },
      }),
    ),
  );

  const highlights = [
    {
      name: "Syrniki",
      description: "Cottage cheese pancakes · Rp 75k",
      photoUrl: p("beshbarmak-rice"),
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
    },
    {
      name: "Beshbarmak",
      description: "Hand-cut noodles & beef · Rp 145k",
      photoUrl: p("dish-beshbarmak"),
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
    },
    {
      name: "Borscht",
      description: "With sour cream & rye · Rp 95k",
      photoUrl: p("dish-borscht"),
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
    },
    {
      name: "Manty",
      description: "Hand-folded daily · Rp 110k",
      photoUrl: p("dish-manty"),
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
    },
  ];
  await Promise.all(
    highlights.map((h, i) =>
      db.highlight.create({
        data: { ...h, sort: i, restaurantId: restaurant.id },
      }),
    ),
  );

  const events = [
    {
      title: "Pelmeni night",
      whenText: "Wed · 21 May · 7pm",
      description: "Roll them together, eat them together. One shot of nastoyka on the house.",
      photoUrl: p("dish-pelmeni"),
      whatsappTopic: "I'd like to join pelmeni night on 21 May",
    },
    {
      title: "Borscht Friday",
      whenText: "Fri · 23 May · 12–10pm",
      description: "Every kind of borscht — 60k IDR all day. Sour cream and salo on the side.",
      photoUrl: p("dish-borscht"),
      whatsappTopic: "Booking a table for Borscht Friday",
    },
    {
      title: "Sunday brunch",
      whenText: "Sun · 25 May · 10am–2pm",
      description: "Syrniki, eggs, fresh juices. Family-style on long tables.",
      photoUrl: p("dish-syrniki"),
      whatsappTopic: "Booking Sunday brunch",
    },
  ];
  await Promise.all(
    events.map((e, i) =>
      db.event.create({
        data: { ...e, sort: i, restaurantId: restaurant.id },
      }),
    ),
  );

  const offerings = [
    {
      title: "Big table for a group",
      description: "Up to 12 people · family-style dinner with a tasting set.",
      photoUrl: p("dish-big-table"),
      whatsappTopic: "I'd like to book the big table",
    },
    {
      title: "Whole-venue hire",
      description: "Birthdays, team off-sites — the place is yours for the evening.",
      photoUrl: p("venue-exterior"),
      whatsappTopic: "I'd like to rent the venue",
    },
  ];
  await Promise.all(
    offerings.map((o, i) =>
      db.offering.create({
        data: { ...o, sort: i, restaurantId: restaurant.id },
      }),
    ),
  );

  const igUrls = [
    "https://www.instagram.com/p/CrCB6dxocBh/",
    "https://www.instagram.com/p/CqxSJ7Yo28W/",
    "https://www.instagram.com/p/CqswAtHIwXh/",
  ];
  await Promise.all(
    igUrls.map((url, i) =>
      db.instagramPost.create({
        data: { url, sort: i, restaurantId: restaurant.id },
      }),
    ),
  );

  console.log(`Готово. Логин: demo@qr-menu.local / password123`);
  console.log(`Слаг ресторана: ${restaurant.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
