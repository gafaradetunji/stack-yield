-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('RECEIVED', 'BRIDGED', 'STACKED', 'WITHDRAW_REQUESTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "ethAddress" TEXT NOT NULL,
    "stacksAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "ethTxHash" TEXT NOT NULL,
    "userEthAddress" TEXT NOT NULL,
    "stacksAddress" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "feeAmount" BIGINT NOT NULL,
    "netAmount" BIGINT NOT NULL,
    "status" "DepositStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bridgedAt" TIMESTAMP(3),
    "stackedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yield_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "distributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yield_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_ethAddress_key" ON "users"("ethAddress");

-- CreateIndex
CREATE UNIQUE INDEX "deposits_ethTxHash_key" ON "deposits"("ethTxHash");

-- CreateIndex
CREATE INDEX "deposits_userEthAddress_idx" ON "deposits"("userEthAddress");

-- CreateIndex
CREATE INDEX "yield_records_userId_idx" ON "yield_records"("userId");

-- CreateIndex
CREATE INDEX "yield_records_depositId_idx" ON "yield_records"("depositId");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yield_records" ADD CONSTRAINT "yield_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yield_records" ADD CONSTRAINT "yield_records_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "deposits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
