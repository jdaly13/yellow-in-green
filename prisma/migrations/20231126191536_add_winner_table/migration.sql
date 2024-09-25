-- AlterTable
ALTER TABLE `Game` ADD COLUMN `nativePayoutAmount` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Winner` (
    `id` VARCHAR(191) NOT NULL,
    `triviaTransaction` VARCHAR(191) NULL,
    `nativeTransaction` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `network` VARCHAR(191) NULL,

    UNIQUE INDEX `Winner_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Winner` ADD CONSTRAINT `Winner_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
