-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PageType" ADD VALUE 'DESIGNER';
ALTER TYPE "PageType" ADD VALUE 'CATERING';
ALTER TYPE "PageType" ADD VALUE 'FLORIST';
ALTER TYPE "PageType" ADD VALUE 'EQUIPMENT';

-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "description" TEXT,
    "priceFrom" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignImage" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Design_pageId_createdAt_idx" ON "Design"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "Design_occasion_createdAt_idx" ON "Design"("occasion", "createdAt");

-- CreateIndex
CREATE INDEX "DesignImage_designId_idx" ON "DesignImage"("designId");

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignImage" ADD CONSTRAINT "DesignImage_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;
