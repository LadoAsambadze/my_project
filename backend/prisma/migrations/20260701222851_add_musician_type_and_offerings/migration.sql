-- AlterEnum
ALTER TYPE "PageType" ADD VALUE 'MUSICIAN';

-- CreateTable
CREATE TABLE "Offering" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT,
    "priceFrom" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferingImage" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferingImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offering_pageId_createdAt_idx" ON "Offering"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "Offering_kind_createdAt_idx" ON "Offering"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "OfferingImage_offeringId_idx" ON "OfferingImage"("offeringId");

-- AddForeignKey
ALTER TABLE "Offering" ADD CONSTRAINT "Offering_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferingImage" ADD CONSTRAINT "OfferingImage_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
