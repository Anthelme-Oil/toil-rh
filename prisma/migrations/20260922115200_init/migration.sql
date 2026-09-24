
-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` VARCHAR(191) NOT NULL,
    `azure_id` VARCHAR(191) NULL,
    `nom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'EMPLOYE',
    `email_manager` VARCHAR(191) NULL DEFAULT '',
    `est_rh` BOOLEAN NOT NULL DEFAULT false,
    `departement` VARCHAR(191) NULL,
    `poste` VARCHAR(191) NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mis_a_jour_le` DATETIME(3) NOT NULL,
    `est_com` BOOLEAN NOT NULL DEFAULT false,
    `est_drh` BOOLEAN NOT NULL DEFAULT false,
    `est_rh_print` BOOLEAN NOT NULL DEFAULT false,
    `est_gestionnaire_salle` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `utilisateurs_azure_id_key`(`azure_id`),
    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `demandes` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `type_demande` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'PENDING_N1',
    `utilisateur_id` VARCHAR(191) NULL,
    `email_demandeur` VARCHAR(191) NOT NULL,
    `nom_demandeur` VARCHAR(191) NOT NULL,
    `email_manager` VARCHAR(191) NULL DEFAULT '',
    `statut_n1` VARCHAR(191) NOT NULL DEFAULT 'EN_ATTENTE',
    `date_validation_n1` DATETIME(3) NULL,
    `commentaire_n1` VARCHAR(191) NULL,
    `statut_rh` VARCHAR(191) NOT NULL DEFAULT 'EN_ATTENTE',
    `date_validation_rh` DATETIME(3) NULL,
    `commentaire_rh` VARCHAR(191) NULL,
    `date_debut` DATETIME(3) NULL,
    `date_fin` DATETIME(3) NULL,
    `nombre_jours` DOUBLE NULL,
    `type_conge` VARCHAR(191) NULL,
    `motif` TEXT NULL,
    `piece_jointe` VARCHAR(191) NULL,
    `donnees_formulaire` LONGTEXT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mis_a_jour_le` DATETIME(3) NOT NULL,
    `commentaire_it` VARCHAR(191) NULL,
    `date_validation_it` DATETIME(3) NULL,
    `historique_validations` LONGTEXT NULL,
    `statut_it` VARCHAR(191) NOT NULL DEFAULT 'EN_ATTENTE',
    `target_user_id` VARCHAR(191) NULL,
    `target_user_name` VARCHAR(191) NULL,

    INDEX `demandes_utilisateur_id_fkey`(`utilisateur_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `videos_intranet` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL DEFAULT 'Institutionnel',
    `duree` VARCHAR(191) NULL DEFAULT '5 min 00 s',
    `description` TEXT NULL,
    `video_url` VARCHAR(191) NOT NULL,
    `thumbnail_url` VARCHAR(191) NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mis_a_jour_le` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salles` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `capacite` INTEGER NOT NULL DEFAULT 10,
    `emplacement` VARCHAR(191) NOT NULL DEFAULT 'Siège T-OIL',
    `equipements` LONGTEXT NULL,
    `est_active` BOOLEAN NOT NULL DEFAULT true,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mis_a_jour_le` DATETIME(3) NOT NULL,

    UNIQUE INDEX `salles_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations_salles` (
    `id` VARCHAR(191) NOT NULL,
    `salle_id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `demandeur_nom` VARCHAR(191) NOT NULL,
    `demandeur_email` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `heure_debut` VARCHAR(191) NOT NULL,
    `heure_fin` VARCHAR(191) NOT NULL,
    `participants` INTEGER NULL DEFAULT 1,
    `motif` TEXT NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'CONFIRMEE',
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mis_a_jour_le` DATETIME(3) NOT NULL,

    INDEX `reservations_salles_salle_id_fkey`(`salle_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parametres` (
    `cle` VARCHAR(100) NOT NULL,
    `valeur` TEXT NOT NULL,
    `description` VARCHAR(255) NULL,
    `mis_a_jour_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`cle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `demandes` ADD CONSTRAINT `demandes_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations_salles` ADD CONSTRAINT `reservations_salles_salle_id_fkey` FOREIGN KEY (`salle_id`) REFERENCES `salles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

