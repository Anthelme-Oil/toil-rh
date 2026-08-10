// ═══════════════════════════════════════════════════════════════
// Données de démonstration — Pour développement local
// ═══════════════════════════════════════════════════════════════
//
// Ce fichier fournit des données mock qui simulent les réponses
// de l'API Microsoft Graph / SharePoint. Utilisé quand les
// variables d'environnement Azure ne sont pas configurées.
// ═══════════════════════════════════════════════════════════════

import type {
  Actualite,
  Annonce,
  Evenement,
  CompteursDemandesParType,
  OutilM365,
} from '@/types';

// ── Actualités mock ──
export const mockActualites: Actualite[] = [
  {
    id: '1',
    titre: 'Réunion mensuelle HSE - Mai 2025',
    description: 'Bilan et perspectives des activités Hygiène, Sécurité et Environnement du mois de mai.',
    datePublication: '2025-05-22',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    categorie: 'HSE',
    auteur: 'Direction HSE & Qualité',
    tempsLecture: '4 min',
    contenu: `
<p class="lead text-lg font-medium text-text-primary mb-4">La réunion mensuelle HSE du mois de mai 2025 s'est tenue avec succès sur le site principal et en visioconférence pour les équipes distantes.</p>
<h3 class="text-lg font-bold text-text-primary mt-6 mb-2">1. Bilan de la sécurité et statistiques</h3>
<p class="mb-4">Au cours du dernier mois, aucun incident majeur avec arrêt de travail n'a été à déplorer. La vigilance constante des équipes sur les terminaux et lors des opérations de pompage porte ses fruits.</p>
<ul class="list-disc pl-6 mb-4 space-y-1">
  <li>Taux de fréquence global : 0 incident.</li>
  <li>Sensibilisation aux équipements de protection individuelle (EPI) effectuée auprès de 140 collaborateurs.</li>
  <li>Inspection sécurité des installations de stockage validée avec mention très bien.</li>
</ul>
<h3 class="text-lg font-bold text-text-primary mt-6 mb-2">2. Objectifs et actions pour le mois de juin</h3>
<p class="mb-4">Pour le mois prochain, la Direction HSE met l'accent sur les contrôles environnementaux et la prévention des risques de forte chaleur durant la période estivale.</p>
<p>Merci à tous pour votre engagement quotidien dans la culture sécurité de T-OIL / STSL-COMPEL.</p>
    `,
  },
  {
    id: '2',
    titre: 'Nouvelle politique globale HSE et règles d’or',
    description: 'Le document officiel est désormais disponible dans la bibliothèque documentaire.',
    datePublication: '2025-05-21',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    categorie: 'Politique',
    auteur: 'Direction Générale',
    tempsLecture: '3 min',
    contenu: `
<p class="lead text-lg font-medium text-text-primary mb-4">La Direction Générale de COMPEL STSL T-OIL annonce la mise à jour officielle des 10 règles d'or de sécurité de l'entreprise.</p>
<h3 class="text-lg font-bold text-text-primary mt-6 mb-2">Un engagement réaffirmé pour la sécurité</h3>
<p class="mb-4">Ces règles mises à jour s'inscrivent dans notre démarche d'amélioration continue et de conformité aux normes internationales de l'industrie pétrolière.</p>
<p class="mb-4">Le document complet est téléchargeable dès maintenant dans l'espace <strong>Base Documentaire</strong> de cet intranet.</p>
    `,
  },
  {
    id: '3',
    titre: 'Lancement de la campagne de formation Q2',
    description: 'Découvrez le calendrier des sessions de formation professionnelle pour le deuxième trimestre.',
    datePublication: '2025-05-20',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
    categorie: 'Formation',
    auteur: 'Ressources Humaines',
    tempsLecture: '5 min',
    contenu: `
<p class="lead text-lg font-medium text-text-primary mb-4">Le département RH ouvre les inscriptions pour les modules de formation continue du 2ème trimestre 2025.</p>
<h3 class="text-lg font-bold text-text-primary mt-6 mb-2">Modules disponibles</h3>
<ul class="list-disc pl-6 mb-4 space-y-1">
  <li>Gestion des risques opérationnels en milieu pétrolier.</li>
  <li>Prise en main des nouveaux outils Microsoft 365.</li>
  <li>Secourisme du travail et premiers secours.</li>
</ul>
<p>Inscrivez-vous directement via le portail de demandes RH ou auprès de votre responsable hiérarchique.</p>
    `,
  },
];

// ── Annonces mock ──
export const mockAnnonces: Annonce[] = [
  {
    id: '1',
    titre: 'Maintenance planifiée de la plateforme',
    contenu:
      'La plateforme sera indisponible le dimanche 25 mai 2025 de 6h00 à 14h00. Merci de votre compréhension.',
    type: 'warning',
    datePublication: '2025-05-20',
  },
];

// ── Événements mock ──
export const mockEvenements: Evenement[] = [];

// ── Compteurs de demandes mock ──
export const mockCompteurs: CompteursDemandesParType = {
  materiel: 3,
  acces: 2,
  it: 5,
  rh: 1,
};

// ── Outils M365 & Applications métiers ──
export const outilsM365: OutilM365[] = [
  // ── Microsoft 365 ──
  {
    nom: 'Powerpoint',
    icone: '/icons/powerpoint.svg',
    url: 'https://powerpoint.office.com',
    couleur: '#D84315',
    categorie: 'Microsoft 365',
  },
  {
    nom: 'OneDrive',
    icone: '/icons/onedrive.svg',
    url: 'https://onedrive.live.com',
    couleur: '#0078D4',
    categorie: 'Microsoft 365',
  },
  {
    nom: 'Outlook',
    icone: '/icons/outlook.svg',
    url: 'https://outlook.office365.com',
    couleur: '#0078D4',
    categorie: 'Microsoft 365',
  },
  {
    nom: 'Teams',
    icone: '/icons/teams.svg',
    url: 'https://teams.microsoft.com',
    couleur: '#6264A7',
    categorie: 'Microsoft 365',
  },

  // ── Applications métiers ──
  {
    nom: 'Procédures QSE',
    icone: '/icons/qse.svg',
    url: '#',
    couleur: '#16A34A',
    categorie: 'Applications métiers',
  },
  {
    nom: 'Gmao',
    icone: '/icons/gmao.svg',
    url: '#',
    couleur: '#0284C7',
    categorie: 'Applications métiers',
  },
  {
    nom: 'stsl-stock',
    icone: '/icons/stsl-stock.svg',
    url: '#',
    couleur: '#0284C7',
    categorie: 'Applications métiers',
  },
  {
    nom: 'Gest-oil',
    icone: '/icons/gest-oil.svg',
    url: '#',
    couleur: '#DC2626',
    categorie: 'Applications métiers',
  },
  {
    nom: 'JDE E1 - 10007',
    icone: '/icons/jde-10007.svg',
    url: '#',
    couleur: '#DC2626',
    categorie: 'Applications métiers',
  },
  {
    nom: 'JDE E1-10006',
    icone: '/icons/jde-10006.svg',
    url: '#',
    couleur: '#DC2626',
    categorie: 'Applications métiers',
  },

  // ── Autres outils & services M365 ──
  {
    nom: 'SharePoint',
    icone: '/icons/sharepoint.svg',
    url: 'https://votre-domaine.sharepoint.com',
    couleur: '#038387',
    categorie: 'Autres outils M365',
  },
  {
    nom: 'Planner',
    icone: '/icons/planner.svg',
    url: 'https://tasks.office.com',
    couleur: '#31752F',
    categorie: 'Autres outils M365',
  },
  {
    nom: 'Forms',
    icone: '/icons/forms.svg',
    url: 'https://forms.office.com',
    couleur: '#008272',
    categorie: 'Autres outils M365',
  },
  {
    nom: 'Power BI',
    icone: '/icons/powerbi.svg',
    url: 'https://app.powerbi.com',
    couleur: '#F2C811',
    categorie: 'Autres outils M365',
  },
  {
    nom: 'Bookings',
    icone: '/icons/bookings.svg',
    url: 'https://outlook.office365.com/owa/?path=/bookings',
    couleur: '#0078D4',
    categorie: 'Autres outils M365',
  },
  {
    nom: 'Support IT',
    icone: '/icons/support.svg',
    url: '/demandes?type=it',
    couleur: '#107C10',
    categorie: 'Autres outils M365',
  },
];
