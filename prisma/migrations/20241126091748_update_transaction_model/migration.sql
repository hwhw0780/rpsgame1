/*
  Warnings:

  - Added the required column `fromBalance` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toBalance` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "details" TEXT,
ADD COLUMN     "fromBalance" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "toBalance" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
