/*
  Warnings:

  - You are about to drop the column `endDate` on the `StakingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `StakingRecord` table. All the data in the column will be lost.
  - Added the required column `penalty` to the `StakingRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StakingRecord_userId_idx";

-- AlterTable
ALTER TABLE "StakingRecord" DROP COLUMN "endDate",
DROP COLUMN "isActive",
ADD COLUMN     "penalty" DOUBLE PRECISION NOT NULL;
