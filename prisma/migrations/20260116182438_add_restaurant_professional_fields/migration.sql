-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "acceptsCard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsCash" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "acceptsPix" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "deliveryFee" INTEGER,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "estimatedDeliveryTime" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "minimumOrder" INTEGER,
ADD COLUMN     "openingHours" TEXT;
