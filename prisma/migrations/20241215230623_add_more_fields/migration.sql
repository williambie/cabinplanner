/*
  Warnings:

  - You are about to drop the column `comment` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "comment",
ADD COLUMN     "adminComment" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "ShoppingList" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ToDoList" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
