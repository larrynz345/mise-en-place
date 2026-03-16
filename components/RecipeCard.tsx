import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Tag } from "lucide-react";

export interface RecipeCardProps {
  id: string;
  title: string;
  category?: string;
  prep_time?: string;
  servings?: number;
  photo_url?: string;
}

export function RecipeCard({
  id,
  title,
  category,
  prep_time,
  servings,
  photo_url,
}: RecipeCardProps) {
  return (
    <Link href={`/recipe/${id}`} className="group block mb-6 break-inside-avoid">
      <div className="relative overflow-hidden rounded-lg bg-brand-dark border border-brand-gold/10 transition-all duration-300 hover:border-brand-gold/40 hover:shadow-[0_0_20px_rgba(200,151,58,0.1)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-brand-dark to-[#1a1510]">
          {photo_url ? (
            <Image
              src={photo_url}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-cream/10">
              <Tag className="h-16 w-16 mb-4 stroke-[1]" />
              <span className="font-serif text-lg tracking-wider opacity-50">MISE</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />

          {category && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center rounded-full border border-brand-gold/30 bg-black/60 px-2.5 py-0.5 text-xs font-mono font-medium text-brand-gold backdrop-blur-md">
                {category}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
            <h3 className="font-serif text-xl font-bold leading-tight text-brand-cream line-clamp-2">
              {title}
            </h3>

            <div className="flex items-center gap-4 text-xs font-mono text-brand-cream/60 mt-1">
              {prep_time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{prep_time}</span>
                </div>
              )}
              {servings && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>{servings}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
