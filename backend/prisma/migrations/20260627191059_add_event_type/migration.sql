-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PARTY', 'BIRTHDAY', 'SPORT', 'HIKING', 'CAMPING', 'OTHER');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'OTHER';
