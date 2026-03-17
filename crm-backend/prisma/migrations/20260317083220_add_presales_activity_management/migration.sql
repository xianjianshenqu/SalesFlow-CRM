-- CreateTable
CREATE TABLE `presales_activities` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `customerId` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `status` ENUM('draft', 'pending_approval', 'approved', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    `approvalStatus` ENUM('none', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'none',
    `approvalNotes` TEXT NULL,
    `approvedById` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `presales_activities_type_idx`(`type`),
    INDEX `presales_activities_status_idx`(`status`),
    INDEX `presales_activities_approvalStatus_idx`(`approvalStatus`),
    INDEX `presales_activities_startTime_idx`(`startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_qr_codes` (
    `id` VARCHAR(191) NOT NULL,
    `activityId` VARCHAR(191) NOT NULL,
    `codeType` VARCHAR(191) NOT NULL,
    `qrCodeUrl` VARCHAR(191) NOT NULL,
    `qrCodeData` TEXT NOT NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `scanCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_qr_codes_activityId_idx`(`activityId`),
    INDEX `activity_qr_codes_codeType_idx`(`codeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_sign_ins` (
    `id` VARCHAR(191) NOT NULL,
    `activityId` VARCHAR(191) NOT NULL,
    `qrCodeId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `isNewCustomer` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `signedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_sign_ins_activityId_idx`(`activityId`),
    INDEX `activity_sign_ins_customerId_idx`(`customerId`),
    INDEX `activity_sign_ins_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_questions` (
    `id` VARCHAR(191) NOT NULL,
    `activityId` VARCHAR(191) NOT NULL,
    `signInId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `question` TEXT NOT NULL,
    `category` VARCHAR(191) NULL,
    `priority` VARCHAR(191) NULL,
    `aiAnalysis` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `answer` TEXT NULL,
    `answeredAt` DATETIME(3) NULL,
    `answeredBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `activity_questions_activityId_idx`(`activityId`),
    INDEX `activity_questions_signInId_idx`(`signInId`),
    INDEX `activity_questions_customerId_idx`(`customerId`),
    INDEX `activity_questions_category_idx`(`category`),
    INDEX `activity_questions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `presales_activities` ADD CONSTRAINT `presales_activities_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presales_activities` ADD CONSTRAINT `presales_activities_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presales_activities` ADD CONSTRAINT `presales_activities_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_qr_codes` ADD CONSTRAINT `activity_qr_codes_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `presales_activities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_sign_ins` ADD CONSTRAINT `activity_sign_ins_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `presales_activities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_sign_ins` ADD CONSTRAINT `activity_sign_ins_qrCodeId_fkey` FOREIGN KEY (`qrCodeId`) REFERENCES `activity_qr_codes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_sign_ins` ADD CONSTRAINT `activity_sign_ins_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_questions` ADD CONSTRAINT `activity_questions_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `presales_activities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_questions` ADD CONSTRAINT `activity_questions_signInId_fkey` FOREIGN KEY (`signInId`) REFERENCES `activity_sign_ins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_questions` ADD CONSTRAINT `activity_questions_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
