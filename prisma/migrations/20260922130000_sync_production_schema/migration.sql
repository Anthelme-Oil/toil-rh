-- AlterTable
ALTER TABLE `demandes`
    -- ADD COLUMN `commentaire_it` VARCHAR(191) NULL,
    -- ADD COLUMN `date_validation_it` DATETIME(3) NULL,
    -- ADD COLUMN `historique_validations` JSON NULL,
    -- ADD COLUMN `statut_it` VARCHAR(191) NOT NULL DEFAULT 'EN_ATTENTE',
    -- ADD COLUMN `target_user_id` VARCHAR(191) NULL,
    -- ADD COLUMN `target_user_name` VARCHAR(191) NULL,
    MODIFY `statut` VARCHAR(191) NOT NULL DEFAULT 'PENDING_N1';

-- AlterTable
ALTER TABLE `parametres`
    MODIFY `mis_a_jour_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);