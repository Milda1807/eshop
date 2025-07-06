/*
  Warnings:

  - Added the required column `shortDescriptiom` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shortDescriptiom" TEXT NOT NULL;
