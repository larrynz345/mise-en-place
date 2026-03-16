import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { RecipeClientViews } from "@/components/RecipeClientViews";

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select(`
      *,
      ingredients (id, amount, name, order_index),
      steps (id, text, time_label, order_index),
      comments (id, text, created_at, user_id)
    `)
    .eq("id", params.id)
    .single();

  if (recipeError || !recipe) {
    notFound();
  }

  recipe.ingredients.sort((a: {order_index: number}, b: {order_index: number}) => a.order_index - b.order_index);
  recipe.steps.sort((a: {order_index: number}, b: {order_index: number}) => a.order_index - b.order_index);
  recipe.comments.sort(
    (a: {created_at: string}, b: {created_at: string}) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <main className="min-h-screen">
      <RecipeClientViews recipe={recipe} />
    </main>
  );
}
