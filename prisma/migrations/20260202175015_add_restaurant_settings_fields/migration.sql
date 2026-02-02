-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "kitchenNotes" TEXT,
ADD COLUMN     "prepStartedAt" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "readyAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "acceptsDelivery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "acceptsDineIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsPickup" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "acceptsScheduled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "brandName" TEXT,
ADD COLUMN     "cnae" TEXT,
ADD COLUMN     "cnpjAnalyzedAt" TEXT,
ADD COLUMN     "cnpjStatus" TEXT,
ADD COLUMN     "cnpjValid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "freeDeliveryFrom" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isMEI" TEXT,
ADD COLUMN     "minDeliveryValue" TEXT,
ADD COLUMN     "pickupMaxTime" TEXT,
ADD COLUMN     "pickupMinTime" TEXT,
ADD COLUMN     "unitName" TEXT,
ADD COLUMN     "useCompletedColumn" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "useReadyColumn" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
