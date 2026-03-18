-- AlterTable
ALTER TABLE `proposals` MODIFY `status` ENUM('draft', 'requirement_analysis', 'designing', 'pending_review', 'review_passed', 'review_rejected', 'customer_proposal', 'negotiation', 'sent', 'accepted', 'rejected', 'expired') NOT NULL DEFAULT 'draft';

-- CreateTable
CREATE TABLE `proposal_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `content` TEXT NOT NULL,
    `products` JSON NULL,
    `terms` TEXT NULL,
    `tags` JSON NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `proposal_templates_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requirement_analyses` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `sourceType` VARCHAR(191) NOT NULL,
    `recordingId` VARCHAR(191) NULL,
    `rawContent` TEXT NULL,
    `aiEnhanced` BOOLEAN NOT NULL DEFAULT false,
    `finalContent` TEXT NULL,
    `extractedNeeds` JSON NULL,
    `painPoints` JSON NULL,
    `budgetHint` JSON NULL,
    `decisionTimeline` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `requirement_analyses_proposalId_key`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proposal_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `reviewerId` VARCHAR(191) NULL,
    `sharedWith` JSON NULL,
    `comments` JSON NULL,
    `result` VARCHAR(191) NULL,
    `resultNotes` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `proposal_reviews_proposalId_key`(`proposalId`),
    INDEX `proposal_reviews_proposalId_idx`(`proposalId`),
    INDEX `proposal_reviews_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_proposal_records` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `emailTo` VARCHAR(191) NOT NULL,
    `emailCc` JSON NULL,
    `emailSubject` VARCHAR(191) NULL,
    `emailBody` TEXT NULL,
    `sendStatus` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `sentAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `openedAt` DATETIME(3) NULL,
    `openCount` INTEGER NOT NULL DEFAULT 0,
    `trackingToken` VARCHAR(191) NULL,
    `viewUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customer_proposal_records_proposalId_key`(`proposalId`),
    UNIQUE INDEX `customer_proposal_records_trackingToken_key`(`trackingToken`),
    INDEX `customer_proposal_records_proposalId_idx`(`proposalId`),
    INDEX `customer_proposal_records_sendStatus_idx`(`sendStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `negotiation_records` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `discussions` JSON NULL,
    `agreedTerms` JSON NULL,
    `finalDocumentUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ongoing',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `negotiation_records_proposalId_key`(`proposalId`),
    INDEX `negotiation_records_proposalId_idx`(`proposalId`),
    INDEX `negotiation_records_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `requirement_analyses` ADD CONSTRAINT `requirement_analyses_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proposal_reviews` ADD CONSTRAINT `proposal_reviews_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_proposal_records` ADD CONSTRAINT `customer_proposal_records_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `negotiation_records` ADD CONSTRAINT `negotiation_records_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
