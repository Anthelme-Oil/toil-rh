-- CreateTable
CREATE TABLE `InteractionGreffe` (
    `id` VARCHAR(191) NOT NULL,
    `referId` VARCHAR(191) NOT NULL,
    `typeRefer` ENUM('ARTICLE', 'VIDEO', 'MEDIA', 'INFO', 'CHAT', 'GROUP', 'UPC') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InteractionGreffe_referId_typeRefer_idx`(`referId`, `typeRefer`),
    UNIQUE INDEX `InteractionGreffe_referId_typeRefer_key`(`referId`, `typeRefer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `interactionGreffeId` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NULL,
    `text` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comment_interactionGreffeId_idx`(`interactionGreffeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reaction` (
    `id` VARCHAR(191) NOT NULL,
    `interactionGreffeId` VARCHAR(191) NOT NULL,
    `type` ENUM('LIKE', 'DISLIKE') NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Reaction_interactionGreffeId_idx`(`interactionGreffeId`),
    UNIQUE INDEX `Reaction_interactionGreffeId_authorEmail_key`(`interactionGreffeId`, `authorEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_interactionGreffeId_fkey` FOREIGN KEY (`interactionGreffeId`) REFERENCES `InteractionGreffe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reaction` ADD CONSTRAINT `Reaction_interactionGreffeId_fkey` FOREIGN KEY (`interactionGreffeId`) REFERENCES `InteractionGreffe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
