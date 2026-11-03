'use client';

// ═══════════════════════════════════════════════════════════════
// Page Publication — Module d'édition & diffusion (Articles & Vidéos)
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
  Video,
  Play,
  Clock,
  Film,
  Link as LinkIcon,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import type { Actualite } from '@/types';

interface PublishedVideo {
  id: string;
  titre: string;
  categorie: string;
  duree: string;
  date: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
}

const CATEGORIES_NEWS = [
  'Général',
  'Ressources Humaines',
  'IT & Digital',
  'Événements & Vie d\'entreprise',
  'Sécurité & Compliance',
  'Projets & Stratégie',
];

const CATEGORIES_VIDEOS = [
  'Institutionnel',
  'Culture & Valeurs',
  'Sécurité & HSE',
  'IT & Digital',
  'RH & Vie Pratique',
  'Formations & Tutoriels',
];

export default function PublicationsPage() {
  const { isCom, isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState<'article' | 'video' | 'evenement'>('article');

  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [publishedVideos, setPublishedVideos] = useState<PublishedVideo[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // State Formulaire Article
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [contenu, setContenu] = useState('');
  const [categorie, setCategorie] = useState('Général');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State Formulaire Vidéo
  const [titreVideo, setTitreVideo] = useState('');
  const [descriptionVideo, setDescriptionVideo] = useState('');
  const [categorieVideo, setCategorieVideo] = useState('Institutionnel');
  const [dureeVideo, setDureeVideo] = useState('5 min 00 s');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // State Formulaire Événement SharePoint (Evenement t-oil)
  const [titreEvt, setTitreEvt] = useState('');
  const [dateDebutEvt, setDateDebutEvt] = useState('');
  const [dateFinEvt, setDateFinEvt] = useState('');
  const [lieuEvt, setLieuEvt] = useState('');
  const [descriptionEvt, setDescriptionEvt] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Charger les actualités, vidéos et événements depuis l'API SharePoint
  const fetchContent = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/actualites');
      if (res.ok) {
        const data = await res.json();
        setActualites(data.actualites || []);
        setPublishedVideos(data.videos || []);
        setPublishedEvents(data.evenements || []);
      }
    } catch (err) {
      console.error('Erreur chargement contenus:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  // Soumission Article
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !description.trim()) {
      setStatusMsg({ type: 'error', text: 'Le titre et le résumé (description) sont requis.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append('type', 'article');
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
        setTitre('');
        setDescription('');
        setContenu('');
        setCategorie('Général');
        setImageFile(null);
        setImagePreview(null);
        fetchContent();
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

  // Soumission Vidéo
  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titreVideo.trim() || !descriptionVideo.trim()) {
      setStatusMsg({ type: 'error', text: 'Le titre et la description de la vidéo sont requis.' });
      return;
    }

    if (!videoFile && !videoUrlInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Veuillez sélectionner un fichier vidéo (.mp4) ou coller une URL SharePoint.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append('type', 'video');
      formData.append('titre', titreVideo.trim());
      formData.append('description', descriptionVideo.trim());
      formData.append('categorie', categorieVideo);
      formData.append('duree', dureeVideo.trim());

      if (videoFile) {
        formData.append('video', videoFile);
      }
      if (videoUrlInput.trim()) {
        formData.append('videoUrl', videoUrlInput.trim());
      }

      const res = await fetch('/api/actualites', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({
          type: 'success',
          text: data.message || 'Vidéo uploadée et publiée avec succès sur SharePoint (T-oil Intranet Files) !',
        });
        setTitreVideo('');
        setDescriptionVideo('');
        setCategorieVideo('Institutionnel');
        setDureeVideo('5 min 00 s');
        setVideoFile(null);
        setVideoUrlInput('');
        setVideoPreview(null);
        fetchContent();
      } else {
        throw new Error(data.error || 'Erreur lors de la publication de la vidéo sur SharePoint.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue lors du transfert de la vidéo.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumission Événement (SharePoint List: Evenement t-oil)
  const handleSubmitEvenement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titreEvt.trim() || !dateDebutEvt) {
      setStatusMsg({ type: 'error', text: 'Le titre et la date de début de l\'événement sont requis.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append('type', 'evenement');
      formData.append('titre', titreEvt.trim());
      formData.append('dateDebut', dateDebutEvt);
      if (dateFinEvt) formData.append('dateFin', dateFinEvt);
      if (lieuEvt.trim()) formData.append('lieu', lieuEvt.trim());
      if (descriptionEvt.trim()) formData.append('description', descriptionEvt.trim());

      const res = await fetch('/api/actualites', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({
          type: 'success',
          text: data.message || 'Événement publié avec succès dans la liste SharePoint (Evenement t-oil) !',
        });
        setTitreEvt('');
        setDateDebutEvt('');
        setDateFinEvt('');
        setLieuEvt('');
        setDescriptionEvt('');
        fetchContent();
      } else {
        throw new Error(data.error || 'Erreur lors de la création de l\'événement sur SharePoint.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue lors de la publication de l\'événement.';
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
          Vous devez avoir le rôle <strong>Communication</strong> ou <strong>Administrateur</strong> pour publier des articles, vidéos et événements sur l'intranet SharePoint.
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
            Espace Publication & Événements SharePoint
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Publiez des articles d'actualités, vidéos et planifiez les événements d'entreprise (Liste SharePoint: <strong>Evenement t-oil</strong>).
          </p>
        </div>
      </div>

      {/* Selecteur de mode : Article vs Vidéo vs Événement */}
      <div className="flex items-center gap-2 sm:gap-3 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 flex-wrap">
        <button
          onClick={() => {
            setActiveTab('article');
            setStatusMsg(null);
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'article'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'article' ? 'text-emerald-600' : ''}`} />
          Publier un Article
        </button>

        <button
          onClick={() => {
            setActiveTab('video');
            setStatusMsg(null);
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'video'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className={`w-4 h-4 ${activeTab === 'video' ? 'text-emerald-600' : ''}`} />
          Publier une Vidéo
        </button>

        <button
          onClick={() => {
            setActiveTab('evenement');
            setStatusMsg(null);
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'evenement'
              ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeTab === 'evenement' ? 'text-emerald-600' : ''}`} />
          Définir un Événement
        </button>
      </div>

      {/* Grid Layout : Formulaire + Liste des contenus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire Principal (7 colonnes) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {/* <Sparkles className="w-5 h-5 text-emerald-600" /> */}
              {activeTab === 'article'
                ? 'Nouvel Article d\'Actualité'
                : activeTab === 'video'
                ? 'Nouvelle Vidéo / Capsule Formation'
                : 'Nouvel Événement à Venir (Evenement t-oil)'}
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

          {/* FORMULAIRE ARTICLE */}
          {activeTab === 'article' ? (
            <form onSubmit={handleSubmitArticle} className="space-y-4">
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
          ) : (
            /* FORMULAIRE VIDÉO */
            <form onSubmit={handleSubmitVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Titre de la Vidéo / Formation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Capsule HSE — Consignes de Sécurité sur Dépôt"
                  value={titreVideo}
                  onChange={(e) => setTitreVideo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" /> Catégorie Vidéo
                  </label>
                  <select
                    value={categorieVideo}
                    onChange={(e) => setCategorieVideo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {CATEGORIES_VIDEOS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Durée estimée
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 5 min 30 s"
                    value={dureeVideo}
                    onChange={(e) => setDureeVideo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
                  />
                </div> */}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Résumé <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Expliquez brièvement le contenu de la vidéo et ses objectifs de formation..."
                  value={descriptionVideo}
                  onChange={(e) => setDescriptionVideo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                />
              </div>

              {/* Sélection du fichier Vidéo */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-emerald-600" /> Source de la Vidéo (MP4)
                </label>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5 font-medium">
                    Option 1 : Importer un fichier vidéo MP4 depuis votre ordinateur
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Le fichier sera stocké automatiquement dans le dossier SharePoint <strong>T-oil Intranet Files</strong>.
                  </p>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-semibold uppercase">OU</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5 font-medium flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-slate-400" /> Option 2 : Coller un lien SharePoint direct vers la vidéo
                  </span>
                  <input
                    type="url"
                    placeholder="https://togooil.sharepoint.com/.../T-oil%20Intranet%20Files/video.mp4"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {videoPreview && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video flex items-center justify-center">
                    <video src={videoPreview} controls className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Upload vers SharePoint (T-oil Intranet Files) en cours...</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4" />
                      <span>Publier la Vidéo sur SharePoint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Formulaire Événement (Evenement t-oil) */}
          {activeTab === 'evenement' && (
            <form onSubmit={handleSubmitEvenement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Titre de l'Événement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Réunion Générale T-OIL, Célébration Q3, Formation Sécurité"
                  value={titreEvt}
                  onChange={(e) => setTitreEvt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date & Heure de Début *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateDebutEvt}
                    onChange={(e) => setDateDebutEvt(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date & Heure de Fin (Optionnel)
                  </label>
                  <input
                    type="datetime-local"
                    value={dateFinEvt}
                    onChange={(e) => setDateFinEvt(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lieu / Emplacement (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="ex: Grande Salle de Réunion, Dépôt Lomé Port, Teams, ..."
                  value={lieuEvt}
                  onChange={(e) => setLieuEvt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Détails de l'Événement (Optionnel)
                </label>
                <textarea
                  rows={3}
                  placeholder="Précisez l'ordre du jour, les personnes convoquées ou la logistique..."
                  value={descriptionEvt}
                  onChange={(e) => setDescriptionEvt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publication dans SharePoint (Evenement t-oil)...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Publier l'Événement sur SharePoint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Colonne de droite : Liste des contenus publiés (5 colonnes) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Liste Événements Publiés */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Événements (Evenement t-oil)
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                {publishedEvents.length}
              </span>
            </h3>

            {isLoadingList ? (
              <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-xs">Chargement des événements...</span>
              </div>
            ) : publishedEvents.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Aucun événement à venir trouvé dans SharePoint.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {publishedEvents.map((evt) => (
                  <div key={evt.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{evt.titre}</h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                        {new Date(evt.dateDebut).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {evt.lieu && (
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        📍 {evt.lieu}
                      </p>
                    )}
                    {evt.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">{evt.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Liste Vidéos Publiées */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-600" />
                Vidéos & Formations
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                {publishedVideos.length}
              </span>
            </h3>

            {isLoadingList ? (
              <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-xs">Chargement des vidéos...</span>
              </div>
            ) : publishedVideos.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Aucune vidéo publiée pour le moment.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100">
                {publishedVideos.map((vid) => (
                  <div key={vid.id} className="pt-3 first:pt-0 flex gap-3 items-start">
                    <div className="relative w-24 h-16 rounded-lg bg-slate-900 shrink-0 overflow-hidden border border-slate-200">
                      <video src={`${vid.videoUrl}#t=2`} preload="metadata" muted className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          {vid.categorie}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-amber-500" /> {vid.duree}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{vid.titre}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{vid.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Liste Articles Publiés */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                Actualités SharePoint
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                {actualites.length}
              </span>
            </h3>

            {isLoadingList ? (
              <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-xs">Chargement des actualités...</span>
              </div>
            ) : actualites.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Aucune actualité publiée pour le moment.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {actualites.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {item.categorie || 'Général'}
                      </span>
                      {item.datePublication && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.datePublication).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{item.titre}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
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
