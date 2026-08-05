'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Newspaper, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function CreerBlogPage() {
  const router = useRouter();
  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('HSE');
  const [description, setDescription] = useState('');
  const [contenu, setContenu] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState('');
  const [messageError, setMessageError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre || !description) {
      setMessageError('Le titre et la description sont obligatoires.');
      return;
    }

    setIsSubmitting(true);
    setMessageSuccess('');
    setMessageError('');

    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('categorie', categorie);
      formData.append('description', description);
      formData.append('contenu', contenu);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/actualites', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'article.');
      }

      setMessageSuccess('Votre article a été publié avec succès dans SharePoint !');
      setTimeout(() => {
        router.push('/informations');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setMessageError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Fil d'Ariane ── */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/informations" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Retour aux actualités
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">Créer un blog / actualité</span>
      </div>

      {/* ── En-tête ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
          <Newspaper className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Publier une actualité</h1>
          <p className="text-sm text-text-secondary">
            Rédigez un article et publiez-le directement dans la liste SharePoint d&apos;entreprise
          </p>
        </div>
      </div>

      {/* ── Notifications ── */}
      {messageSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{messageSuccess}</span>
        </div>
      )}

      {messageError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{messageError}</span>
        </div>
      )}

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Titre de l&apos;article *
          </label>
          <input
            type="text"
            required
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="ex: Campagne de sensibilisation HSE 2026"
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Catégorie
            </label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
            >
              <option value="HSE">HSE (Hygiène, Sécurité, Environnement)</option>
              <option value="Politique">Politique & Stratégie</option>
              <option value="Formation">Formation & RH</option>
              <option value="Événement">Événement</option>
              <option value="Technique">Informatique & Tech</option>
              <option value="Général">Information Générale</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Image de couverture (Optionnelle)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
                id="blog-image-upload"
              />
              <label
                htmlFor="blog-image-upload"
                className="w-full px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-primary bg-surface-alt hover:bg-primary/5 cursor-pointer flex items-center justify-center gap-2 text-sm text-text-secondary transition-all"
              >
                <Upload className="w-4 h-4 text-primary" />
                <span className="truncate">
                  {imageFile ? imageFile.name : 'Choisir une image...'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Résumé / Résumé d&apos;introduction *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Aperçu court affiché sur les cartes d'actualités..."
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Contenu complet de l&apos;article
          </label>
          <textarea
            rows={8}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Rédigez ici le corps complet de votre article..."
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-sans"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-4 border-t border-border">
          <Link
            href="/informations"
            className="px-6 py-3 rounded-xl border border-border text-text-secondary hover:bg-surface-alt font-medium transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:opacity-95 text-white font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publication sur SharePoint...
              </>
            ) : (
              'Publier le blog'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
