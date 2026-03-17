-- AlterTable
ALTER TABLE `customers` ADD COLUMN `engagementScore` INTEGER NULL,
    ADD COLUMN `lastAnalysisAt` DATETIME(3) NULL,
    ADD COLUMN `riskScore` INTEGER NULL;

-- CreateTable
CREATE TABLE `follow_up_suggestions` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `suggestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `script` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `follow_up_suggestions_customerId_idx`(`customerId`),
    INDEX `follow_up_suggestions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_reports` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `summary` TEXT NOT NULL,
    `highlights` JSON NULL,
    `risks` JSON NULL,
    `nextActions` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `daily_reports_userId_date_type_key`(`userId`, `date`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opportunity_scores` (
    `id` VARCHAR(191) NOT NULL,
    `opportunityId` VARCHAR(191) NOT NULL,
    `overallScore` INTEGER NOT NULL,
    `winProbability` INTEGER NOT NULL,
    `engagementScore` INTEGER NOT NULL,
    `budgetScore` INTEGER NOT NULL,
    `authorityScore` INTEGER NOT NULL,
    `needScore` INTEGER NOT NULL,
    `timingScore` INTEGER NOT NULL,
    `factors` JSON NULL,
    `riskFactors` JSON NULL,
    `recommendations` JSON NULL,
    `analyzedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `opportunity_scores_opportunityId_key`(`opportunityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `churn_alerts` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `riskLevel` VARCHAR(191) NOT NULL,
    `riskScore` INTEGER NOT NULL,
    `reasons` JSON NULL,
    `signals` JSON NULL,
    `suggestions` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `handledAt` DATETIME(3) NULL,
    `handledBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `churn_alerts_customerId_idx`(`customerId`),
    INDEX `churn_alerts_riskLevel_idx`(`riskLevel`),
    INDEX `churn_alerts_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_insights` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `extractedNeeds` JSON NULL,
    `extractedBudget` JSON NULL,
    `decisionMakers` JSON NULL,
    `painPoints` JSON NULL,
    `competitorInfo` JSON NULL,
    `timeline` JSON NULL,
    `confidence` INTEGER NOT NULL DEFAULT 0,
    `source` VARCHAR(191) NOT NULL DEFAULT 'ai_analysis',
    `analyzedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customer_insights_customerId_key`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `follow_up_suggestions` ADD CONSTRAINT `follow_up_suggestions_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_reports` ADD CONSTRAINT `daily_reports_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opportunity_scores` ADD CONSTRAINT `opportunity_scores_opportunityId_fkey` FOREIGN KEY (`opportunityId`) REFERENCES `opportunities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `churn_alerts` ADD CONSTRAINT `churn_alerts_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_insights` ADD CONSTRAINT `customer_insights_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
