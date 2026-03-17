-- CreateTable
CREATE TABLE `sales_performances` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `calls` INTEGER NOT NULL DEFAULT 0,
    `meetings` INTEGER NOT NULL DEFAULT 0,
    `visits` INTEGER NOT NULL DEFAULT 0,
    `proposals` INTEGER NOT NULL DEFAULT 0,
    `closedDeals` INTEGER NOT NULL DEFAULT 0,
    `revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `conversionRate` DOUBLE NULL,
    `avgDealSize` DECIMAL(15, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sales_performances_userId_idx`(`userId`),
    INDEX `sales_performances_date_idx`(`date`),
    UNIQUE INDEX `sales_performances_userId_date_key`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coaching_suggestions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `actions` JSON NULL,
    `metrics` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,

    INDEX `coaching_suggestions_userId_idx`(`userId`),
    INDEX `coaching_suggestions_type_idx`(`type`),
    INDEX `coaching_suggestions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_match_records` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NOT NULL,
    `matchScore` DOUBLE NOT NULL,
    `matchedSkills` JSON NULL,
    `missingSkills` JSON NULL,
    `aiRecommendation` BOOLEAN NOT NULL DEFAULT false,
    `factors` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `resource_match_records_requestId_idx`(`requestId`),
    INDEX `resource_match_records_resourceId_idx`(`resourceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sales_performances` ADD CONSTRAINT `sales_performances_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coaching_suggestions` ADD CONSTRAINT `coaching_suggestions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_match_records` ADD CONSTRAINT `resource_match_records_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `presales_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_match_records` ADD CONSTRAINT `resource_match_records_resourceId_fkey` FOREIGN KEY (`resourceId`) REFERENCES `presales_resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
