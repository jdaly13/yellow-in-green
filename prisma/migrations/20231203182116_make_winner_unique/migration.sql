/*
  Warnings:

  - A unique constraint covering the columns `[gameId]` on the table `Winner` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Winner_gameId_key` ON `Winner`(`gameId`);
