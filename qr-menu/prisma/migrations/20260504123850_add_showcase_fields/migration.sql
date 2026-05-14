-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "bookingMessage" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "googleMapsUrl" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "mainMenuPdfUrl" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "specialMenuPdfUrl" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "whatsappPhone" TEXT;

-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "instagramUrl" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "Highlight_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "whenText" TEXT NOT NULL,
    "photoUrl" TEXT,
    "whatsappTopic" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "Event_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "whatsappTopic" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "Offering_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstagramPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "InstagramPost_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Highlight_restaurantId_idx" ON "Highlight"("restaurantId");

-- CreateIndex
CREATE INDEX "Event_restaurantId_idx" ON "Event"("restaurantId");

-- CreateIndex
CREATE INDEX "Offering_restaurantId_idx" ON "Offering"("restaurantId");

-- CreateIndex
CREATE INDEX "InstagramPost_restaurantId_idx" ON "InstagramPost"("restaurantId");
