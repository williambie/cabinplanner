/*
  Warnings:

  - You are about to drop the `DummyData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DummyData";

-- DropEnum
DROP TYPE "DummyDataType";

-- CreateTable
CREATE TABLE "DummyShoppingList" (
    "id" UUID NOT NULL,
    "itemName" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "isBought" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DummyShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DummyToDoList" (
    "id" UUID NOT NULL,
    "task" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DummyToDoList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DummyReservation" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,

    CONSTRAINT "DummyReservation_pkey" PRIMARY KEY ("id")
);
