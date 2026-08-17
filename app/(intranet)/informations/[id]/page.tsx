// ═══════════════════════════════════════════════════════════════
// Page Détail d'un Article — /informations/[id] (Style Bannière Vert Émeraude)
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Newspaper,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import ArticleActions from '@/components/articles/ArticleActions';
import { getActualiteById, getActualites } from '@/lib/sharepoint';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getActualiteById(id);

  if (!article) {
    return {
      title: 'Article introuvable',
    };
  }

  return {
    title: `${article.titre} | T-OIL Intranet`,
    description: article.description,
  };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getActualiteById(id);

  if (!article) {
    notFound();
  }

  const allArticles = await getActualites(10);
  const autresArticles = allArticles.filter((item) => item.id !== id);

  return (
    <article className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 animate-fade-in space-y-6">
      {/* ── Fil d'Ariane & Bouton retour ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium">
            Accueil
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/informations" className="hover:text-emerald-600 transition-colors font-medium">
            Actualités
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-[250px] sm:max-w-[400px]">
            {article.titre}
          </span>
        </nav>

        <Link
          href="/informations"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all border border-emerald-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux actualités
        </Link>
      </div>

      {/* ── BANNIÈRE EN-TÊTE DE L'ARTICLE (Inspirée de la capture 3) ── */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white min-h-[300px] sm:min-h-[380px] flex flex-col justify-end p-6 sm:p-12">
        {/* Image en fond avec overlay dégradé vert émeraude */}
        {article.imageUrl ? (
          <>
            <img
              src={article.imageUrl}
              alt={article.titre}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/70 to-emerald-900/40" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        <div className="relative z-10 space-y-4 max-w-4xl">
          {article.categorie && (
            <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-md">
              {article.categorie}
            </span>
          )}

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {article.titre}
          </h1>

          {/* Métadonnées (Date avec icône + Temps de lecture) */}
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-emerald-100 font-medium pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>{formatDate(article.datePublication)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>{article.tempsLecture || '2 min'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-300" />
              <span>{article.auteur || 'Communication Interne'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenu de l'article & Actions ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lecture</span>
          <ArticleActions titre={article.titre} />
        </div>

        <div className="text-slate-800 text-base leading-relaxed space-y-4">
          {article.contenu ? (
            <div
              className="prose max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-emerald-600"
              dangerouslySetInnerHTML={{ __html: article.contenu }}
            />
          ) : (
            <p className="text-slate-700 text-lg leading-relaxed">{article.description}</p>
          )}
        </div>
      </div>

      {/* ── Articles connexes ── */}
      {autresArticles.length > 0 && (
        <section className="pt-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">À lire également</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {autresArticles.slice(0, 2).map((item) => (
              <Link
                key={item.id}
                href={`/informations/${item.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 border-b-4 border-b-emerald-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {item.titre}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 pt-4 mt-2 border-t border-slate-100">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>{formatDate(item.datePublication)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
