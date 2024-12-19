-- CreateTable
CREATE TABLE "PaymentSlip" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "slipUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentSlip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSlip_orderId_key" ON "PaymentSlip"("orderId");

-- AddForeignKey
ALTER TABLE "PaymentSlip" ADD CONSTRAINT "PaymentSlip_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
