import { createClient } from "@/utils/supabase/server";
import { RecipeGrid } from "@/components/RecipeGrid";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: { query?: string; category?: string };
}) {
  const supabase = createClient();
  const query = searchParams?.query || "";
  const category = searchParams?.category || "";

  let supabaseQuery = supabase
    .from("recipes")
    .select("id, title, category, prep_time, servings, photo_url")
    .order("created_at", { ascending: false });

  if (query) {
    supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
  }
  if (category && category !== "all") {
    supabaseQuery = supabaseQuery.eq("category", category);
  }

  const { data: recipes, error } = await supabaseQuery;

  const { data: allRecipes } = await supabase.from("recipes").select("category");
  const categoriesSet = new Set(allRecipes?.map((r) => r.category).filter(Boolean));
  const categories = Array.from(categoriesSet) as string[];

  return (
    <main className="min-h-screen bg-brand-dark pb-24">
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 via-brand-dark to-brand-dark" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tighter text-brand-gold mb-6 drop-shadow-sm">
            MISE <span className="text-brand-cream/60 font-light">/ en place</span>
          </h1>
          <p className="mx-auto max-w-2xl font-mono text-sm md:text-base text-brand-cream/70 tracking-wide uppercase">
            A private editorial cookbook for your most treasured recipes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-y border-brand-gold/10 py-6">
          <div className="w-full md:w-96 relative">
            <form action="/" className="relative flex items-center w-full">
              <Search className="absolute left-3 h-4 w-4 text-brand-gold/50" />
              <Input
                name="query"
                type="search"
                defaultValue={query}
                placeholder="Search recipes..."
                className="pl-10 rounded-full border-brand-gold/30 bg-black/40 focus-visible:ring-brand-gold/50"
              />
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href={`/?query=${query}&category=all`}
              className={`rounded-full border px-4 py-1.5 text-xs font-mono transition-colors ${
                !category || category === "all"
                  ? "bg-brand-gold text-brand-dark border-brand-gold"
                  : "bg-transparent text-brand-cream/60 border-brand-gold/20 hover:border-brand-gold/50 hover:text-brand-cream"
              }`}
            >
              All
            </a>
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/?query=${query}&category=${encodeURIComponent(cat)}`}
                className={`rounded-full border px-4 py-1.5 text-xs font-mono transition-colors ${
                  category === cat
                    ? "bg-brand-gold text-brand-dark border-brand-gold"
                    : "bg-transparent text-brand-cream/60 border-brand-gold/20 hover:border-brand-gold/50 hover:text-brand-cream"
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {error ? (
          <p className="text-red-400 font-mono text-center">Failed to load recipes.</p>
        ) : (
          <RecipeGrid recipes={recipes || []} />
        )}
      </section>
    </main>
  );
}
