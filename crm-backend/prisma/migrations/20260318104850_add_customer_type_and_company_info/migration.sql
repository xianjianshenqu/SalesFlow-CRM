-- AlterTable
ALTER TABLE `customers` ADD COLUMN `businessScope` TEXT NULL,
    ADD COLUMN `companyFullName` VARCHAR(191) NULL,
    ADD COLUMN `companyStatus` VARCHAR(191) NULL,
    ADD COLUMN `creditCode` VARCHAR(191) NULL,
    ADD COLUMN `customerType` VARCHAR(191) NOT NULL DEFAULT 'non_user',
    ADD COLUMN `establishDate` DATETIME(3) NULL,
    ADD COLUMN `legalPerson` VARCHAR(191) NULL,
    ADD COLUMN `registeredCapital` DECIMAL(15, 2) NULL;
