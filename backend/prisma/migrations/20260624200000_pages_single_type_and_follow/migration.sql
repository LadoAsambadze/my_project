/*
  Warnings:

  - The values [VENUE,FLORIST,CATERER,MUSIC_DJ,DECORATOR,PLANNER,OTHER] on the enum `PageType` will be removed. If these variants are still used in the database, this will fail.
*/
-- AlterEnum (shrink PageType to a single value)
BEGIN;
CREATE TYPE "PageType_new" AS ENUM ('PHOTOGRAPHER');
ALTER TABLE "Page" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Page" ALTER COLUMN "type" TYPE "PageType_new" USING ("type"::text::"PageType_new");
ALTER TYPE "PageType" RENAME TO "PageType_old";
ALTER TYPE "PageType_new" RENAME TO "PageType";
DROP TYPE "PageType_old";
ALTER TABLE "Page" ALTER COLUMN "type" SET DEFAULT 'PHOTOGRAPHER';
COMMIT;

-- CreateTable
CREATE TABLE "PageFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageFollow_pageId_idx" ON "PageFollow"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "PageFollow_followerId_pageId_key" ON "PageFollow"("followerId", "pageId");

-- AddForeignKey
ALTER TABLE "PageFollow" ADD CONSTRAINT "PageFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageFollow" ADD CONSTRAINT "PageFollow_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
