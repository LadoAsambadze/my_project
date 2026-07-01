-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('GOING', 'INTERESTED');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "cateringOfferId" TEXT,
ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "floristItemId" TEXT,
ADD COLUMN     "offeringId" TEXT,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "workId" TEXT;

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "priceFrom" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkMedia" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloristItem" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT,
    "priceFrom" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FloristItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloristItemImage" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FloristItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRsvp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "RsvpStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRsvp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "designId" TEXT,
    "eventId" TEXT,
    "cateringOfferId" TEXT,
    "offeringId" TEXT,
    "workId" TEXT,
    "floristItemId" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "category" "PageType" NOT NULL,
    "occasion" TEXT,
    "eventDate" TIMESTAMP(3),
    "city" TEXT,
    "budgetFrom" INTEGER,
    "budgetTo" INTEGER,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Work_pageId_createdAt_idx" ON "Work"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "Work_category_createdAt_idx" ON "Work"("category", "createdAt");

-- CreateIndex
CREATE INDEX "WorkMedia_workId_idx" ON "WorkMedia"("workId");

-- CreateIndex
CREATE INDEX "FloristItem_pageId_createdAt_idx" ON "FloristItem"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "FloristItem_kind_createdAt_idx" ON "FloristItem"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "FloristItemImage_itemId_idx" ON "FloristItemImage"("itemId");

-- CreateIndex
CREATE INDEX "EventRsvp_eventId_status_idx" ON "EventRsvp"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRsvp_userId_eventId_key" ON "EventRsvp"("userId", "eventId");

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "Like_designId_idx" ON "Like"("designId");

-- CreateIndex
CREATE INDEX "Like_eventId_idx" ON "Like"("eventId");

-- CreateIndex
CREATE INDEX "Like_cateringOfferId_idx" ON "Like"("cateringOfferId");

-- CreateIndex
CREATE INDEX "Like_offeringId_idx" ON "Like"("offeringId");

-- CreateIndex
CREATE INDEX "Like_workId_idx" ON "Like"("workId");

-- CreateIndex
CREATE INDEX "Like_floristItemId_idx" ON "Like"("floristItemId");

-- CreateIndex
CREATE INDEX "Like_requestId_idx" ON "Like"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_designId_key" ON "Like"("userId", "designId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_eventId_key" ON "Like"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_cateringOfferId_key" ON "Like"("userId", "cateringOfferId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_offeringId_key" ON "Like"("userId", "offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_workId_key" ON "Like"("userId", "workId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_floristItemId_key" ON "Like"("userId", "floristItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_requestId_key" ON "Like"("userId", "requestId");

-- CreateIndex
CREATE INDEX "Request_category_createdAt_idx" ON "Request"("category", "createdAt");

-- CreateIndex
CREATE INDEX "Request_authorId_createdAt_idx" ON "Request"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Request_createdAt_idx" ON "Request"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_eventId_createdAt_idx" ON "Comment"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_cateringOfferId_createdAt_idx" ON "Comment"("cateringOfferId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_offeringId_createdAt_idx" ON "Comment"("offeringId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_workId_createdAt_idx" ON "Comment"("workId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_floristItemId_createdAt_idx" ON "Comment"("floristItemId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_requestId_createdAt_idx" ON "Comment"("requestId", "createdAt");

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkMedia" ADD CONSTRAINT "WorkMedia_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristItem" ADD CONSTRAINT "FloristItem_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristItemImage" ADD CONSTRAINT "FloristItemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "FloristItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_cateringOfferId_fkey" FOREIGN KEY ("cateringOfferId") REFERENCES "CateringOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_floristItemId_fkey" FOREIGN KEY ("floristItemId") REFERENCES "FloristItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_cateringOfferId_fkey" FOREIGN KEY ("cateringOfferId") REFERENCES "CateringOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_floristItemId_fkey" FOREIGN KEY ("floristItemId") REFERENCES "FloristItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
