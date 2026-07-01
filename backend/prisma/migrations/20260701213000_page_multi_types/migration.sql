-- Pages can now belong to several vendor categories at once: replace the
-- single `type` column with a `types` list, keeping each page's current type
-- as a one-element list.
ALTER TABLE "Page" ADD COLUMN "types" "PageType"[];
UPDATE "Page" SET "types" = ARRAY["type"];
ALTER TABLE "Page" DROP COLUMN "type";
