import { RecipeCardProps, RecipeCard } from "./RecipeCard";

export interface RecipeGridProps {
  recipes: RecipeCardProps[];
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-brand-gold/10 rounded-lg bg-black/20">
        <p className="font-serif text-2xl text-brand-gold/50 mb-2">No recipes found.</p>
        <p className="font-mono text-sm text-brand-cream/40">Try adjusting your filters or add a new recipe.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} {...recipe} />
      ))}
    </div>
  );
}
