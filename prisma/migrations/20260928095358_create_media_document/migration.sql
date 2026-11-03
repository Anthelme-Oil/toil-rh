-- CreateTable
CREATE TABLE `mediaDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `objective` TEXT NULL,
    `department` VARCHAR(50) NOT NULL,
    `category` VARCHAR(50) NULL,
    `format` VARCHAR(20) NOT NULL,
    `extension` VARCHAR(20) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `fileUrl` TEXT NOT NULL,
    `fileSize` BIGINT NULL,
    `version` VARCHAR(30) NULL,
    `previousVersionId` INTEGER NULL,
    `replacedById` INTEGER NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `visibility` VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    `authorId` VARCHAR(255) NULL,
    `authorName` VARCHAR(255) NULL,
    `authorEmail` VARCHAR(255) NULL,
    `publishedById` VARCHAR(255) NULL,
    `publishedByName` VARCHAR(255) NULL,
    `publishedByEmail` VARCHAR(255) NULL,
    `publishedAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `tags` JSON NULL,

    INDEX `mediaDocument_department_idx`(`department`),
    INDEX `mediaDocument_category_idx`(`category`),
    INDEX `mediaDocument_format_idx`(`format`),
    INDEX `mediaDocument_status_idx`(`status`),
    INDEX `mediaDocument_visibility_idx`(`visibility`),
    INDEX `mediaDocument_isPublished_idx`(`isPublished`),
    INDEX `mediaDocument_publishedAt_idx`(`publishedAt`),
    INDEX `mediaDocument_createdAt_idx`(`createdAt`),
    INDEX `mediaDocument_views_idx`(`views`),
    INDEX `mediaDocument_downloads_idx`(`downloads`),
    INDEX `mediaDocument_department_isPublished_idx`(`department`, `isPublished`),
    INDEX `mediaDocument_status_isPublished_idx`(`status`, `isPublished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mediaDocument` ADD CONSTRAINT `mediaDocument_previousVersionId_fkey` FOREIGN KEY (`previousVersionId`) REFERENCES `mediaDocument`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mediaDocument` ADD CONSTRAINT `mediaDocument_replacedById_fkey` FOREIGN KEY (`replacedById`) REFERENCES `mediaDocument`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
