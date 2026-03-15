-- CreateTable
CREATE TABLE `cold_visit_records` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `inputType` VARCHAR(191) NOT NULL,
    `inputContent` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `intelligenceResult` JSON NULL,
    `customerId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'analyzed',
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cold_visit_records_companyName_idx`(`companyName`),
    INDEX `cold_visit_records_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cold_visit_records` ADD CONSTRAINT `cold_visit_records_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cold_visit_records` ADD CONSTRAINT `cold_visit_records_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
