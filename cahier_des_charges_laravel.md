# 📋 CAHIER DES CHARGES — REFONTE DU PORTAIL INTRANET T-OIL SOUS LARAVEL 11

## 1. CONTEXTE & OBJECTIFS DU PROJET

### 1.1 Contexte
Le portail Intranet T-OIL centralise l'accès aux actualités d'entreprise, à l'annuaire du personnel, au catalogue de services internes et à la gestion des demandes de congés et autorisations d'absence.
La version actuelle sous Next.js (TypeScript) a permis de valider les fonctionnalités, mais a rencontré des frictions d'intégration avec l'écosystème Microsoft 365 (gestion des middlewares Edge/Turbopack, rafraîchissement des tokens OAuth, proxy d'images SharePoint et synchronisation synchrone).

### 1.2 Objectifs de la Refonte sous Laravel
- **Simplicité & Stabilité Backend** : Exploiter la robustesse native de Laravel 11 pour les entrées/sorties, le routage, et la gestion des sessions/rôles.
- **Intégration Microsoft 365 fluide** : Gérer l'authentification SSO Entra ID (Azure AD) et les requêtes Microsoft Graph API via un backend PHP 8.3 performant et prédictible.
- **Proxy Média Robuste** : Gérer le cache des jetons d'accès OAuth et le streaming binaire des images SharePoint via le système de cache et de stockage natif de Laravel.
- **Gestion Asynchrone (Queues)** : Déporter la synchronisation SharePoint et les envois d'emails de validation dans des tâches d'arrière-plan (Laravel Queues / Redis).

---

## 2. ARCHITECTURE TECHNIQUE RECOMMANDÉE

```
                                ┌───────────────────────────────────────────────┐
                                │              Front-end UI                     │
                                │   Laravel Blade + TailwindCSS + Alpine.js     │
                                │         OU Inertia.js + Vue.js 3              │
                                └───────────────────────┬───────────────────────┘
                                                        │
                                                        ▼
                                ┌───────────────────────────────────────────────┐
                                │             Laravel 11 App Engine             │
                                │  - Routage Web & API                          │
                                │  - Authentification Socialite (Azure AD SSO)  │
                                │  - Système de Rôles (Spatie Permission)       │
                                │  - Proxy d'Images avec Cache Redis            │
                                └───────────────┬───────────────────────┬───────┘
                                                │                       │
                        ┌───────────────────────┘                       └───────────────────────┐
                        ▼                                                                       ▼
┌───────────────────────────────────────────────┐                       ┌───────────────────────────────────────────────┐
│              Base de Données                  │                       │            Microsoft Graph API                │
│             MySQL 8.0 / MariaDB               │                       │             (SharePoint Online)               │
│ - Users, Rôles, Hiérarchie (N+1)              │                       │ - Stockage Fichiers & Images (Drives)         │
│ - Congés, Demandes, Logs d'Audit              │                       │ - Listes SharePoint (Actualités, Demandes)    │
└───────────────────────────────────────────────┘                       └───────────────────────────────────────────────┘
```

### 2.1 Stack Technique
| Composant | Technologie Recommandée | Rôle |
|---|---|---|
| **Langage / Framework** | PHP 8.3 / **Laravel 11** | Cœur applicatif, ORM Eloquent, Routage, Sécurité |
| **Front-end UI** | **Blade + TailwindCSS + Alpine.js** (ou **Inertia.js + Vue 3**) | Rendu réactif, moderne et sans complexité de build d'API REST séparée |
| **Base de Données** | **MySQL 8.0** / MariaDB | Persistence locale des utilisateurs, rôles, demandes de congés et audits |
| **SSO / Auth** | `laravel/socialite` + `socialiteproviders/microsoft-azure` | Authentification SSO fluide Microsoft Entra ID |
| **Permissions** | `spatie/laravel-permission` | Gestion fine des rôles (`EMPLOYE`, `MANAGER`, `RH`, `ADMIN`) |
| **Cache & Queues** | **Redis** + Laravel Horizon | Cache des tokens OAuth, cache des images proxy, traitement asynchrone des emails et sync SharePoint |
| **Graph API SDK** | `microsoft/microsoft-graph` ou Guzzle HTTP | Communication native avec SharePoint Online |

---

## 3. SPÉCIFICATIONS FONCTIONNELLES PAR MODULE

### Module 1 : Authentification & Gestion des Profils
- **Connexion SSO Azure AD** : Redirection vers le portail Microsoft 365 entreprise.
- **Auto-provisioning Utilisateur** : À la première connexion, création automatique de la fiche utilisateur locale avec les infos d'Entra ID (Nom, Prénom, Email, JobTitle, Department).
- **Rattachement Hiérarchique N+1** : Champ `manager_id` dans la table `users` pour le circuit de validation des congés.
- **Rôles & Habilitations** :
  - `EMPLOYE` : Soumettre des demandes, consulter les actualités/annonces.
  - `MANAGER` : Valider les demandes des collaborateurs directs.
  - `RH` : Traitement global des demandes de congés et export des données.
  - `ADMIN` : Configuration système et attribution des rôles.

### Module 2 : Actualités & Communication Interne
- **Publication d'Articles** : Formulaire de création (Titre, Catégorie, Extrait, Contenu avec éditeur WYSIWYG, Image de couverture).
- **Stockage Hybride** :
  - L'image de couverture est uploadée vers SharePoint Drive (dossier `Blogs/`).
  - L'URL SharePoint est enregistrée dans la base de données.
- **Proxy d'Images Laravel** :
  - Route dédiée `/media/proxy?url=...` avec middleware d'authentification.
  - Le controller PHP utilise le token d'application Azure AD (`ClientSecretCredential`) pour déréférencer le fichier via l'API Graph `shares/{shareId}/driveItem/content`.
  - Mise en cache Redis de l'image binaire pour une vitesse d'affichage instantanée.

### Module 3 : Gestion des Congés & Demandes Internes
- **Catalogue des Demandes** (11 types de demandes : Congé annuel, Arrêt maladie, Demande IT, Fournitures, etc.).
- **Workflow de Validation** :
  ```
  [Employé soumet] ──► [Notification Email N+1] ──► [Manager Approuve/Refuse] ──► [Notification Email Employé + RH]
  ```
- **Gestion des Fichiers Joints** : Upload sécurisé des justificatifs (ex: certificat médical) sur le stockage local ou SharePoint.

### Module 4 : Annuaire d'Entreprise & Organigramme
- Recherche par nom, département ou poste.
- Affichage de la chaîne hiérarchique (Manager N+1 et collaborateurs).

---

## 4. CONCEPTION TECHNIQUE & BASE DE DONNÉES (SCHEMA RELATIONNEL)

### 4.1 Principales Tables SQL (Migrations Laravel)

#### Table `users`
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    azure_id VARCHAR(255) UNIQUE NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NULL, -- Null pour SSO
    job_title VARCHAR(255) NULL,
    department VARCHAR(255) NULL,
    manager_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### Table `actualites`
```sql
CREATE TABLE actualites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    titre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    contenu LONGTEXT NULL,
    categorie VARCHAR(100) DEFAULT 'COMMUNIQUE',
    image_url VARCHAR(1024) NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Table `demandes_conges`
```sql
CREATE TABLE demandes_conges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type_conge ENUM('ANNUEL', 'ARRET_MALADIE', 'MATERNITE', 'EVENEMENT_FAMILIAL', 'SANS_SOLDE') NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    motif TEXT NULL,
    fichier_joint VARCHAR(1024) NULL,
    statut ENUM('EN_ATTENTE', 'APPROUVE_MANAGER', 'APPROUVE_RH', 'REFUSE') DEFAULT 'EN_ATTENTE',
    manager_id BIGINT UNSIGNED NULL,
    comm_manager TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);
```

---

## 5. SPÉCIFICATION TECHNIQUE DU PROXY MEDIA LARAVEL

Sous Laravel, le proxy d'image devient extrêmement simple, propre et performant :

```php
// app/Http/Controllers/MediaProxyController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class MediaProxyController extends Controller
{
    public function proxy(Request $request)
    {
        $imageUrl = $request->query('url');
        if (!$imageUrl) {
            return response()->file(public_path('images/fallback.svg'));
        }

        // Clé de cache basée sur l'URL
        $cacheKey = 'proxy_img_' . md5($imageUrl);

        $imageData = Cache::remember($cacheKey, now()->addHours(24), function () use ($imageUrl) {
            $token = $this->getAzureAccessToken();
            if (!$token) return null;

            // Encodage Base64 URL-Safe pour l'API Graph Shares
            $shareId = 'u!' . rtrim(strtr(base64_encode($imageUrl), '+/', '-_'), '=');

            $response = Http::withToken($token)
                ->get("https://graph.microsoft.com/v1.0/shares/{$shareId}/driveItem/content");

            if ($response->successful()) {
                return [
                    'body' => $response->body(),
                    'contentType' => $response->header('Content-Type') ?? 'image/jpeg',
                ];
            }

            return null;
        });

        if (!$imageData) {
            return response()->file(public_path('images/fallback.svg'));
        }

        return response($imageData['body'])
            ->header('Content-Type', $imageData['contentType'])
            ->header('Cache-Control', 'public, max-age=86400');
    }

    private function getAzureAccessToken(): ?string
    {
        return Cache::remember('azure_graph_token', now()->addMinutes(50), function () {
            $response = Http::asForm()->post("https://login.microsoftonline.com/" . config('services.azure.tenant_id') . "/oauth2/v2.0/token", [
                'client_id' => config('services.azure.client_id'),
                'client_secret' => config('services.azure.client_secret'),
                'scope' => 'https://graph.microsoft.com/.default',
                'grant_type' => 'client_credentials',
            ]);

            return $response->json('access_token');
        });
    }
}
```

---

## 6. COMPARATIF & AVANTAGES LARAVEL VS NEXT.JS POUR T-OIL

| Critère | Version Actuelle (Next.js) | Nouvelle Version (Laravel 11) |
|---|---|---|
| **Complexité Routage & Middleware** | Élevée (Changements Next.js 16 Edge/Turbopack, `proxy.ts` vs `middleware.ts`) | **Très faible** (Middleware PHP simple et stable) |
| **Authentification SSO** | NextAuth v5 (Bêta, configuration parfois instable) | **Socialite Microsoft** (Standard éprouvé, stable) |
| **Proxy Média SharePoint** | Gestion en mémoire manuelle par Node.js | **Cache Redis natif** + HTTP Client Guzzle/Laravel |
| **Gestion des Rôles** | Logique sur mesure dans la DB / Session | **`spatie/laravel-permission`** (Standard de l'industrie) |
| **Tâches d'Arrière-Plan** | Nécessite un cron externe / API route | **Laravel Queues / Horizon** natif |
| **Performance d'Affichage** | SSR / Hydratation React | **Blade / Livewire** (Ultra rapide, zéro surcoût JS) |

---

## 7. PLAN DE MIGRATION & ÉTAPES D'EXÉCUTION

1. **Étape 1 : Initialisation du Projet Laravel 11**
   - Setup Laravel 11 (`composer create-project laravel/laravel toil-laravel`).
   - Installation de TailwindCSS, Alpine.js et `spatie/laravel-permission`.

2. **Étape 2 : Configuration Auth & SSO Microsoft**
   - Integration `socialiteproviders/microsoft-azure`.
   - Creation des migrations `users` et du système de rattachement N+1.

3. **Étape 3 : Implémentation du Proxy Média & Service Graph**
   - Migration de la logique d'upload d'images et du proxy média avec cache Redis.

4. **Étape 4 : Déploiement des Modules Fonctionnels**
   - Controller & Vues Blade pour **Actualités**.
   - Circuit de validation des **Demandes de Congés**.
   - Annuaire du personnel.

5. **Étape 5 : Migration des Données & Recette**
   - Export des données MySQL existantes vers le nouveau schéma Laravel.
   - Tests de recette SSO, upload SharePoint et validation des congés.
