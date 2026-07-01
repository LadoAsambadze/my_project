-- Merge the MUSICIAN and EQUIPMENT vendor categories into a single
-- MUSIC_SOUND category ("Music, sound & light"): performers, DJs, and
-- sound/light rental companies are one scene and belong under one label.
-- Existing pages with either old value get the new one (deduplicated in the
-- follow-up UPDATE for pages that carried both).
CREATE TYPE "PageType_new" AS ENUM ('PHOTOGRAPHER', 'DESIGNER', 'CATERING', 'FLORIST', 'MUSIC_SOUND');

ALTER TABLE "Page"
  ALTER COLUMN "types" TYPE "PageType_new"[]
  USING (
    array_replace(
      array_replace("types"::text[], 'MUSICIAN', 'MUSIC_SOUND'),
      'EQUIPMENT', 'MUSIC_SOUND'
    )::"PageType_new"[]
  );

UPDATE "Page" SET "types" = ARRAY(SELECT DISTINCT t FROM unnest("types") AS t);

ALTER TYPE "PageType" RENAME TO "PageType_old";
ALTER TYPE "PageType_new" RENAME TO "PageType";
DROP TYPE "PageType_old";
