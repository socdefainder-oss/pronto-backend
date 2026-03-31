-- AddColumn ASAAS subaccount fields to restaurants table
ALTER TABLE "restaurants" ADD COLUMN "asaasSubaccountId" TEXT;
ALTER TABLE "restaurants" ADD COLUMN "asaasSubaccountApiKey" TEXT;
ALTER TABLE "restaurants" ADD COLUMN "asaasSplitPercentage" DECIMAL(5,2) NOT NULL DEFAULT 5.0;
ALTER TABLE "restaurants" ADD COLUMN "asaasStatus" TEXT NOT NULL DEFAULT 'inactive';
ALTER TABLE "restaurants" ADD COLUMN "asaasCreatedAt" TIMESTAMP(3);
