-- Création de la table suggestions pour MySQL
CREATE TABLE IF NOT EXISTS `suggestions` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'IMPLEMENTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    -- Informations sur l'auteur
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NULL,
    `authorAvatar` VARCHAR(191) NULL,

    -- Dates
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;