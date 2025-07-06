/*
  Warnings:

  - You are about to drop the column `shortDescriptiom` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "shortDescriptiom",
ADD COLUMN     "shortDescription" TEXT;
