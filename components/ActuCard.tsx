import Image from 'next/image';

interface NewsCardProps {
  title: string;
  description: string;
  imageUrl: string;
  publishDate: string;
}

export default function NewsCard({ title, description, imageUrl, publishDate }: NewsCardProps) {
  return (
    <div className="group relative h-[450px] w-full max-w-sm overflow-hidden rounded-2xl bg-gray-900 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {/* Image de fond avec Next.js Image */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 384px"
        className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
        priority
      />

      {/* Overlay dégradé pour la lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Contenu textuel */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Date de publication */}
        <span className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          {publishDate}
        </span>

        {/* Titre */}
        <h3 className="mb-2 text-2xl font-bold leading-tight text-white line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-300 line-clamp-3 opacity-90 group-hover:opacity-100 transition-opacity">
          {description}
        </p>
        
        {/* Effet visuel optionnel : une ligne décorative qui s'étire au survol */}
        <div className="mt-4 h-[2px] w-0 bg-emerald-400 transition-all duration-300 group-hover:w-full" />
      </div>
    </div>
  );
}
