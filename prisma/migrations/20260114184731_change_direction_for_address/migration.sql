/*
  Warnings:

  - You are about to drop the column `direction` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OWNER';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "direction",
ADD COLUMN     "address" TEXT;
