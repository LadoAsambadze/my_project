-- CreateTable
CREATE TABLE "CateringOffer" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT,
    "pricePerPerson" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CateringOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CateringOfferImage" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CateringOfferImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CateringOffer_pageId_createdAt_idx" ON "CateringOffer"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "CateringOffer_kind_createdAt_idx" ON "CateringOffer"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "CateringOfferImage_offerId_idx" ON "CateringOfferImage"("offerId");

-- AddForeignKey
ALTER TABLE "CateringOffer" ADD CONSTRAINT "CateringOffer_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CateringOfferImage" ADD CONSTRAINT "CateringOfferImage_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "CateringOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
