// Static Bali Betula content for the landing-only build. No database —
// the showcase is a marketing page, all data lives here. Photo paths
// resolve to public/photos/bali-betula/<name>.jpg.

const p = (name: string) => `/photos/bali-betula/${name}.jpg`;

export type BetulaHighlight = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  instagramUrl: string | null;
};

export type BetulaEvent = {
  id: string;
  title: string;
  description: string | null;
  whenText: string;
  photoUrl: string | null;
  whatsappTopic: string;
};

export type BetulaOffering = {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  whatsappTopic: string;
};

export const BETULA = {
  slug: "demo",
  name: "Bali Betula",
  description:
    "Social Hideout & Eatery in Pererenan. Hand-rolled dumplings, slow-cooked stews, the Indian Ocean around the corner. Good food · good people · good vibes.",
  address: "Jl. Raya Kesambi, Kerobokan, Bali 80361",
  primaryColor: "#7d3a4c",
  theme: "hideout",
  currency: "IDR",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Bali+Betula+Kerobokan",
  instagramUrl: "https://www.instagram.com/betula_restaurant/",
  whatsappPhone: "+6282144556677",
  bookingMessage: "Hi Betula! I'd like to book a table for ...",
  mainMenuPdfUrl: null as string | null,
  specialMenuPdfUrl: null as string | null,
  logoUrl: p("logo-bowl"),

  highlights: [
    {
      id: "h-syrniki",
      name: "Syrniki",
      description: "Cottage cheese pancakes · Rp 75k",
      photoUrl: p("beshbarmak-rice"),
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
    },
    {
      id: "h-beshbarmak",
      name: "Beshbarmak",
      description: "Hand-cut noodles & beef · Rp 145k",
      photoUrl: p("dish-beshbarmak"),
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
    },
    {
      id: "h-borscht",
      name: "Borscht",
      description: "With sour cream & rye · Rp 95k",
      photoUrl: p("dish-borscht"),
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
    },
    {
      id: "h-manty",
      name: "Manty",
      description: "Hand-folded daily · Rp 110k",
      photoUrl: p("dish-manty"),
      instagramUrl: "https://www.instagram.com/betula_restaurant/",
    },
  ] satisfies BetulaHighlight[],

  events: [
    {
      id: "e-pelmeni",
      title: "Pelmeni night",
      whenText: "Wed · 21 May · 7pm",
      description:
        "Roll them together, eat them together. One shot of nastoyka on the house.",
      photoUrl: p("dish-pelmeni"),
      whatsappTopic: "I'd like to join pelmeni night on 21 May",
    },
    {
      id: "e-borscht",
      title: "Borscht Friday",
      whenText: "Fri · 23 May · 12–10pm",
      description:
        "Every kind of borscht — 60k IDR all day. Sour cream and salo on the side.",
      photoUrl: p("dish-borscht"),
      whatsappTopic: "Booking a table for Borscht Friday",
    },
    {
      id: "e-brunch",
      title: "Sunday brunch",
      whenText: "Sun · 25 May · 10am–2pm",
      description: "Syrniki, eggs, fresh juices. Family-style on long tables.",
      photoUrl: p("dish-syrniki"),
      whatsappTopic: "Booking Sunday brunch",
    },
  ] satisfies BetulaEvent[],

  offerings: [
    {
      id: "o-big-table",
      title: "Big table for a group",
      description: "Up to 12 people · family-style dinner with a tasting set.",
      photoUrl: p("dish-big-table"),
      whatsappTopic: "I'd like to book the big table",
    },
    {
      id: "o-venue",
      title: "Whole-venue hire",
      description:
        "Birthdays, team off-sites — the place is yours for the evening.",
      photoUrl: p("venue-exterior"),
      whatsappTopic: "I'd like to rent the venue",
    },
  ] satisfies BetulaOffering[],

  instagramUrls: [
    "https://www.instagram.com/p/CrCB6dxocBh/",
    "https://www.instagram.com/p/CqxSJ7Yo28W/",
    "https://www.instagram.com/p/CqswAtHIwXh/",
  ],
};
