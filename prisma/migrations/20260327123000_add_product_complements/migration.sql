-- Add product metadata fields
ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "pdvCode" TEXT,
ADD COLUMN IF NOT EXISTS "portionSize" TEXT,
ADD COLUMN IF NOT EXISTS "servesUpTo" INTEGER,
ADD COLUMN IF NOT EXISTS "hasComplements" BOOLEAN NOT NULL DEFAULT false;

-- Complement groups per product
CREATE TABLE IF NOT EXISTS "product_complement_groups" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "minSelect" INTEGER NOT NULL DEFAULT 0,
  "maxSelect" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'active',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_complement_groups_pkey" PRIMARY KEY ("id")
);

-- Complement options per group
CREATE TABLE IF NOT EXISTS "product_complement_options" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_complement_options_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "product_complement_groups_productId_idx" ON "product_complement_groups"("productId");
CREATE INDEX IF NOT EXISTS "product_complement_groups_sortOrder_idx" ON "product_complement_groups"("sortOrder");
CREATE INDEX IF NOT EXISTS "product_complement_groups_status_idx" ON "product_complement_groups"("status");

CREATE INDEX IF NOT EXISTS "product_complement_options_groupId_idx" ON "product_complement_options"("groupId");
CREATE INDEX IF NOT EXISTS "product_complement_options_sortOrder_idx" ON "product_complement_options"("sortOrder");
CREATE INDEX IF NOT EXISTS "product_complement_options_status_idx" ON "product_complement_options"("status");

ALTER TABLE "product_complement_groups"
ADD CONSTRAINT "product_complement_groups_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "products"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_complement_options"
ADD CONSTRAINT "product_complement_options_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "product_complement_groups"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
