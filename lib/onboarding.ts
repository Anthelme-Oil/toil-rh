// ═══════════════════════════════════════════════════════════════
// Service Onboarding & Vidéos — Intégration SharePoint & Cache
// ═══════════════════════════════════════════════════════════════

import 'server-only';
import { getGraphClient, getSiteApiBase } from './graph';
import { serverCache } from './cache';
import type { OnboardingModule, UserOnboardingProgress } from '@/types';

// TTL pour les modules onboarding (10 minutes car données quasi statiques)
const ONBOARDING_MODULES_TTL = 10 * 60 * 1000;
// TTL pour la progression utilisateur (5 minutes avec invalidation sur mutation)
const ONBOARDING_PROGRESS_TTL = 5 * 60 * 1000;

/** Données par défaut / Mock pour l'onboarding T-OIL */
export const mockOnboardingModules: OnboardingModule[] = [
  {
    id: 'onb-01',
    code: 'ONB-01',
    titre: 'Bienvenue chez COMPEL STSL T-OIL',
    description: 'Mot de bienvenue de la Direction Générale, vision stratégique et présentation du groupe pétrolier.',
    categorie: 'culture',
    videoUrl: '/api/images/proxy?url=' + encodeURIComponent('https://togooil.sharepoint.com/sites/NotrePortail/Documents%20partages/T-oil%20Intranet%20Files/VIDEO-2026-06-04-13-54-29.mp4'),
    thumbnailUrl: '/api/images/proxy?url=' + encodeURIComponent('https://togooil.sharepoint.com/sites/NotrePortail/Documents%20partages/T-oil%20Intranet%20Files/VIDEO-2026-06-04-13-54-29.mp4') + '#t=2',
    dureeMinutes: 8,
    ordre: 1,
    estObligatoire: true,
    documentsAssocies: [
      {
        id: 'doc-01',
        titre: 'Mot de la Direction & Vision 2026.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '1.2 Mo',
      },
      {
        id: 'doc-02',
        titre: 'Organigramme Général COMPEL-STSL-TOIL.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '850 Ko',
      },
    ],
  },
  {
    id: 'onb-02',
    code: 'ONB-02',
    titre: 'Histoire, Valeurs & Engagement RSE',
    description: 'Découvrez la raison d\'être de T-OIL, nos engagements pour la transition énergétique et la qualité de service.',
    categorie: 'culture',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    dureeMinutes: 5,
    ordre: 2,
    estObligatoire: true,
    documentsAssocies: [
      {
        id: 'doc-03',
        titre: 'Charte Éthique & Valeurs T-OIL.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '2.1 Mo',
      },
    ],
  },
  {
    id: 'onb-03',
    code: 'ONB-03',
    titre: 'Consignes de Sécurité & Règles d\'Or HSE',
    description: 'Directives fondamentales de sécurité sur les dépôts pétroliers et dans les bureaux. Tolérance zéro sur la sécurité.',
    categorie: 'securite',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    dureeMinutes: 6,
    ordre: 3,
    estObligatoire: true,
    documentsAssocies: [
      {
        id: 'doc-04',
        titre: 'Livret des 10 Règles d\'Or HSE.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '3.4 Mo',
      },
      {
        id: 'doc-05',
        titre: 'Plan d\'Évacuation & Numéros d\'Urgence.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '620 Ko',
      },
    ],
  },
  {
    id: 'onb-04',
    code: 'ONB-04',
    titre: 'Prise en main des Outils IT & Intranet',
    description: 'Guide complet pour utiliser Microsoft 365, Teams, soumettre des demandes de congés et accéder aux applications métiers.',
    categorie: 'it',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    dureeMinutes: 4,
    ordre: 4,
    estObligatoire: true,
    documentsAssocies: [
      {
        id: 'doc-06',
        titre: 'Guide Utilisateur Intranet T-OIL.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '1.8 Mo',
      },
      {
        id: 'doc-07',
        titre: 'Charte Informatique & Bonnes Pratiques.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '940 Ko',
      },
    ],
  },
  {
    id: 'onb-05',
    code: 'ONB-05',
    titre: 'Guide RH & Vie Pratique de l\'Employé',
    description: 'Tout savoir sur le temps de travail, la mutuelle d\'entreprise, la restauration et l\'accompagnement de votre carrière.',
    categorie: 'rh',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyflights.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
    dureeMinutes: 5,
    ordre: 5,
    estObligatoire: false,
    documentsAssocies: [
      {
        id: 'doc-08',
        titre: 'Livret d\'Accueil Collaborateur T-OIL 2026.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '4.5 Mo',
      },
    ],
  },
  {
    id: 'onb-06',
    code: 'ONB-06',
    titre: 'Cybersécurité & Protection des Données',
    description: 'Reconnaître le Phishing, sécuriser ses mots de passe et protéger la confidentialité des données clients & partenaires.',
    categorie: 'it',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    dureeMinutes: 4,
    ordre: 6,
    estObligatoire: true,
    documentsAssocies: [
      {
        id: 'doc-09',
        titre: 'Fiche Réflexe Cybersécurité.pdf',
        url: '#',
        format: 'pdf',
        tailleFormatted: '1.1 Mo',
      },
    ],
  },
];

/**
 * Enregistrement des données de progression en mémoire de secours (au cas où SharePoint pas configuré)
 */
const fallbackProgressStore = new Map<string, string[]>();

/**
 * Récupère la liste des modules d'onboarding (avec cache serveur)
 */
export async function getOnboardingModules(): Promise<OnboardingModule[]> {
  return serverCache.getOrFetch(
    'onboarding:modules',
    async () => {
      const graphClient = getGraphClient();
      let modules = [...mockOnboardingModules];

      if (graphClient) {
        const siteBase = getSiteApiBase();
        try {
          const response = await graphClient
            .api(`${siteBase}/lists/Onboarding_Modules/items?expand=fields`)
            .get();

          const items = response.value || [];
          if (items.length > 0) {
            modules = items.map((item: any) => {
              const f = item.fields || {};
              return {
                id: item.id,
                code: f.Code || f.Title || `ONB-${item.id}`,
                titre: f.Titre || f.Title || '',
                description: f.Description || '',
                categorie: (f.Categorie || 'culture').toLowerCase() as OnboardingModule['categorie'],
                videoUrl: f.VideoUrl || '',
                thumbnailUrl: f.ThumbnailUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
                dureeMinutes: parseInt(f.DureeMinutes || '5', 10),
                ordre: parseInt(f.Ordre || '1', 10),
                estObligatoire: f.EstObligatoire !== false,
              };
            });
          }
        } catch (err) {
          console.warn('[Onboarding] Utilisation des modules de base + vidéos SharePoint:', err);
        }
      }

      // Incorporer les vidéos dynamiquement publiées depuis SharePoint List
      try {
        const { getVideosFromSharePoint } = await import('./sharepoint');
        const spVideos = await getVideosFromSharePoint();
        if (spVideos.length > 0) {
          spVideos.forEach((vid, idx) => {
            const exists = modules.some((m) => m.titre === vid.titre || m.videoUrl === vid.videoUrl);
            if (!exists) {
              const dureeNum = parseInt(vid.duree.replace(/\D/g, ''), 10) || 5;
              let cat: OnboardingModule['categorie'] = 'culture';
              const catLower = vid.categorie.toLowerCase();
              if (catLower.includes('securite') || catLower.includes('hse')) cat = 'securite';
              else if (catLower.includes('it') || catLower.includes('digital')) cat = 'it';
              else if (catLower.includes('rh')) cat = 'rh';

              modules.push({
                id: `sp-vid-${vid.id}`,
                code: `SP-VID-${idx + 1}`,
                titre: vid.titre,
                description: vid.description,
                categorie: cat,
                videoUrl: vid.videoUrl,
                thumbnailUrl: vid.thumbnailUrl,
                dureeMinutes: dureeNum,
                ordre: modules.length + 1,
                estObligatoire: true,
              });
            }
          });
        }
      } catch (spVideoErr) {
        console.warn('[Onboarding] Erreur fusion vidéos SharePoint:', spVideoErr);
      }

      return modules;
    },
    ONBOARDING_MODULES_TTL
  );
}

/**
 * Récupère le suivi de progression pour un utilisateur donné
 */
export async function getUserOnboardingProgress(userEmail: string): Promise<UserOnboardingProgress> {
  const emailKey = userEmail.toLowerCase().trim();

  return serverCache.getOrFetch(
    `onboarding:progress:${emailKey}`,
    async () => {
      const modules = await getOnboardingModules();
      const graphClient = getGraphClient();

      let completedModules: string[] = fallbackProgressStore.get(emailKey) || [];

      if (graphClient) {
        const siteBase = getSiteApiBase();
        try {
          const res = await graphClient
            .api(`${siteBase}/lists/Onboarding_Suivi/items?expand=fields`)
            .get();

          const items = res.value || [];
          const userItem = items.find((it: any) => {
            const f = it.fields || {};
            const mail = (f.UserEmail || f.Title || '').toLowerCase().trim();
            return mail === emailKey;
          });

          if (userItem) {
            const f = userItem.fields || {};
            const rawCompleted = f.ModulesCompletes || '';
            completedModules = rawCompleted ? rawCompleted.split(',').map((s: string) => s.trim()) : [];
          }
        } catch (err) {
          console.warn('[Onboarding] Erreur lecture progression SharePoint, secours mémoire:', err);
        }
      }

      const totalModules = modules.length;
      const completedCount = completedModules.length;
      const percentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

      return {
        userEmail,
        modulesCompletes: completedModules,
        pourcentageGlobal: percentage,
        dernierAcces: new Date().toISOString(),
      };
    },
    ONBOARDING_PROGRESS_TTL
  );
}

/**
 * Marque un module comme complété pour un utilisateur (Mutation + Invalidation de cache)
 */
export async function toggleModuleCompletion(
  userEmail: string,
  moduleId: string
): Promise<UserOnboardingProgress> {
  const emailKey = userEmail.toLowerCase().trim();
  const currentProgress = await getUserOnboardingProgress(userEmail);

  let updatedModules: string[];
  if (currentProgress.modulesCompletes.includes(moduleId)) {
    // Si déjà vu, possibilité de le décocher (toggle) ou de le garder
    updatedModules = currentProgress.modulesCompletes.filter((id) => id !== moduleId);
  } else {
    updatedModules = [...currentProgress.modulesCompletes, moduleId];
  }

  // Mise à jour de secours mémoire
  fallbackProgressStore.set(emailKey, updatedModules);

  // Tentative de mise à jour SharePoint
  const graphClient = getGraphClient();
  if (graphClient) {
    const siteBase = getSiteApiBase();
    try {
      const res = await graphClient
        .api(`${siteBase}/lists/Onboarding_Suivi/items?expand=fields`)
        .get();

      const items = res.value || [];
      const userItem = items.find((it: any) => {
        const f = it.fields || {};
        const mail = (f.UserEmail || f.Title || '').toLowerCase().trim();
        return mail === emailKey;
      });

      const modulesJoined = updatedModules.join(',');

      if (userItem) {
        await graphClient
          .api(`${siteBase}/lists/Onboarding_Suivi/items/${userItem.id}/fields`)
          .patch({
            ModulesCompletes: modulesJoined,
            DernierAcces: new Date().toISOString(),
          });
      } else {
        await graphClient.api(`${siteBase}/lists/Onboarding_Suivi/items`).post({
          fields: {
            Title: emailKey,
            UserEmail: emailKey,
            ModulesCompletes: modulesJoined,
            DernierAcces: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      console.warn('[Onboarding] Échec enregistrement SharePoint, conservé en mémoire local:', err);
    }
  }

  // ⚡ Invalidation immédiate du cache serveur pour cet utilisateur
  serverCache.invalidate(`onboarding:progress:${emailKey}`);

  return getUserOnboardingProgress(userEmail);
}
