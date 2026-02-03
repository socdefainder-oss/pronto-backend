-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "asaasCustomerId" TEXT,
ADD COLUMN     "cpfCnpj" TEXT;

-- CreateIndex
CREATE INDEX "customers_asaasCustomerId_idx" ON "customers"("asaasCustomerId");
