// ═══════════════════════════════════════════════════════════════
// Page Détail d'un Article / Blog — /informations/[id]
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
import { mockActualites } from '@/lib/mock-data';
import { getActualiteById, getActualites } from '@/lib/sharepoint';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const spArticle = await getActualiteById(id);
  const article = spArticle || mockActualites.find((item) => item.id === id);

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
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getCatStyle(cat?: string) {
  switch (cat?.toLowerCase()) {
    case 'hse':
      return 'bg-primary-100 text-primary-700 border-primary-200';
    case 'politique':
      return 'bg-accent-50 text-accent border-red-200';
    case 'formation':
      return 'bg-amber-50 text-amber-dark border-amber-200';
    default:
      return 'bg-surface-alt text-text-secondary border-border';
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { id } = await params;
  const spArticle = await getActualiteById(id);
  const article = spArticle || mockActualites.find((item) => item.id === id);

  if (!article) {
    notFound();
  }

  const allArticles = (await getActualites(10)) || mockActualites;
  const autresArticles = allArticles.filter((item) => item.id !== id);


  return (
    <article className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* ── Fil d'Ariane ── */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-text-muted mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          Accueil
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        <Link href="/informations" className="hover:text-primary transition-colors">
          Actualités
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-text-primary font-medium truncate max-w-[250px] sm:max-w-[400px]">
          {article.titre}
        </span>
      </nav>

      {/* ── Bouton retour ── */}
      <div className="mb-6">
        <Link
          href="/informations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux actualités
        </Link>
      </div>

      {/* ── Carte principale de l'article ── */}
      <div
        className="bg-white rounded-2xl overflow-hidden border border-border/60 mb-10"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* En-tête / Couverture visuelle */}
        <div className="relative w-full h-56 sm:h-72 bg-gradient-to-br from-primary-700 via-primary to-primary-dark flex items-center justify-center p-6 text-white overflow-hidden">
          {article.imageUrl ? (
            <>
              <img
                src={article.imageUrl}
                alt={article.titre}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <Newspaper className="w-32 h-32 opacity-15 absolute right-4 bottom-4" />
            </>
          )}

          <div className="relative z-10 max-w-2xl text-center">
            {article.categorie && (
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border ${getCatStyle(article.categorie)} bg-white/90 backdrop-blur-sm`}
              >
                {article.categorie}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white mb-4">
              {article.titre}
            </h1>
          </div>
        </div>

        {/* Métadonnées de l'article */}
        <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-text-secondary">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 font-medium">
              <User className="w-4 h-4 text-primary" />
              {article.auteur || 'Communication Interne'}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(article.datePublication)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              {article.tempsLecture || '3 min'} de lecture
            </div>
          </div>

          {/* Actions rapides */}
          <ArticleActions titre={article.titre} />
        </div>

        {/* Corps de l'article */}
        <div className="p-6 sm:p-10 text-text-primary text-base leading-relaxed">
          {article.contenu ? (
            <div
              className="prose max-w-none prose-headings:text-text-primary prose-p:text-text-secondary"
              dangerouslySetInnerHTML={{ __html: article.contenu }}
            />
          ) : (
            <p className="text-text-secondary">{article.description}</p>
          )}
        </div>
      </div>

      {/* ── Articles connexes / À lire aussi ── */}
      {autresArticles.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text-primary">À lire également</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {autresArticles.map((item) => (
              <Link
                key={item.id}
                href={`/informations/${item.id}`}
                className="bg-white rounded-xl p-5 border border-border card-hover flex flex-col justify-between group"
              >
                <div>
                  {item.categorie && (
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 border ${getCatStyle(item.categorie)}`}
                    >
                      {item.categorie}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {item.titre}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border/50">
                  <span>{formatDate(item.datePublication)}</span>
                  <span className="font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    Lire la suite →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
