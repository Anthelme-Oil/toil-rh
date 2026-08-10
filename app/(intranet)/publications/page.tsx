'use client';

// ═══════════════════════════════════════════════════════════════
// Page Publication — Module d'édition & diffusion d'actualités SharePoint
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  Newspaper,
  Send,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
  FileText,
  Sparkles,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import type { Actualite } from '@/types';

const CATEGORIES_NEWS = [
  'Général',
  'Ressources Humaines',
  'IT & Digital',
  'Événements & Vie d\'entreprise',
  'Sécurité & Compliance',
  'Projets & Stratégie',
];

export default function PublicationsPage() {
  const { userEmail, isCom, isAdmin } = useUser();
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Form State
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [contenu, setContenu] = useState('');
  const [categorie, setCategorie] = useState('Général');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Charger les actualités existantes
  const fetchActualites = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/actualites');
      if (res.ok) {
        const data = await res.json();
        setActualites(data.actualites || []);
      }
    } catch (err) {
      console.error('Erreur chargement actualités:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchActualites();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !description.trim()) {
      setStatusMsg({ type: 'error', text: 'Le titre et le résumé (description) sont requis.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append('titre', titre.trim());
      formData.append('description', description.trim());
      formData.append('contenu', contenu.trim());
      formData.append('categorie', categorie);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/actualites', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({
          type: 'success',
          text: data.message || 'Article publié avec succès sur SharePoint !',
        });
        // Réinitialiser le formulaire
        setTitre('');
        setDescription('');
        setContenu('');
        setCategorie('Général');
        setImageFile(null);
        setImagePreview(null);
        // Rafraîchir la liste
        fetchActualites();
      } else {
        throw new Error(data.error || 'Erreur lors de la publication sur SharePoint.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAccess = isAdmin || isCom;

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Accès restreint aux Publications</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Vous devez avoir le rôle <strong>Communication</strong> ou <strong>Administrateur</strong> pour publier des actualités sur l'intranet SharePoint.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-emerald-600" />
            Espace Publication & News SharePoint
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Rédigez et publiez les annonces officielles directement dans les listes SharePoint du portail T-OIL.
          </p>
        </div>
      </div>

      {/* Grid Layout : Formulaire d'édition + Liste des actualités */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de Redaction (7 colonnes) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Nouvel Article d'Actualité
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
              Synchro SharePoint Online
            </span>
          </div>

          {statusMsg && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titre de l'Actualité <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex: Lancement du nouveau portail RH T-OIL"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Catégorie
              </label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {CATEGORIES_NEWS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Résumé / Accroche */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Résumé court (Accroche) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Brève description visible sur le carrousel d'accueil..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Contenu Détaillé */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Corps de l'Article (Optionnel)
              </label>
              <textarea
                rows={5}
                placeholder="Contenu complet de l'article avec tous les détails..."
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Image de Couverture */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Image de Couverture (Optionnel)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />

              {imagePreview && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Aperçu" className="w-full object-cover max-h-48" />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publication SharePoint en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publier l'Actualité</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Aperçu / Liste des Dernières Actualités SharePoint (5 colonnes) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              Dernières Actualités SharePoint
            </h3>

            {isLoadingList ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-xs">Chargement depuis SharePoint...</span>
              </div>
            ) : actualites.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Aucune actualité publiée pour le moment.
              </div>
            ) : (
              <div className="space-y-3.5 divide-y divide-slate-100">
                {actualites.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {item.categorie || 'Général'}
                      </span>
                      {item.datePublication && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.datePublication).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.titre}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
