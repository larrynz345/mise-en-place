"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";

export function CinematicView({ recipe }: { recipe: {
  id: string;
  title: string;
  category?: string;
  description?: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  photo_url?: string;
  ingredients: {id: string; amount: string; name: string}[];
  steps: {id: string; text: string; time_label: string}[];
  comments: {id: string; text: string; created_at: string}[];
} }) {
  const [servings, setServings] = useState(recipe.servings || 1);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(recipe.comments || []);

  const scaleFactor = servings / (recipe.servings || 1);

  const toggleIngredient = (id: string) => {
    const next = new Set(checkedIngredients);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedIngredients(next);
  };

  const toggleStep = (id: string) => {
    const next = new Set(completedSteps);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompletedSteps(next);
  };

  const parseAmount = (amountStr: string) => {
    if (!amountStr) return "";

    const match = amountStr.match(/^([\d./]+)(.*)$/);
    if (match) {
      const numPart = match[1];
      const textPart = match[2];

      try {
        let val = 0;
        if (numPart.includes('/')) {
          const [n, d] = numPart.split('/');
          val = parseFloat(n) / parseFloat(d);
        } else {
          val = parseFloat(numPart);
        }

        if (!isNaN(val)) {
          const scaled = val * scaleFactor;
          const formatted = parseFloat(scaled.toFixed(2)).toString();
          return `${formatted}${textPart}`;
        }
      } catch {
        // ignore
      }
    }

    return amountStr;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        recipe_id: recipe.id,
        user_id: user.id,
        text: newComment,
      })
      .select()
      .single();

    if (!error && data) {
      setComments([data, ...comments]);
      setNewComment("");
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen text-brand-cream pb-24">
      {/* Hero */}
      <div className="relative h-[60vh] w-full bg-black">
        {recipe.photo_url ? (
          <Image
            src={recipe.photo_url}
            alt={recipe.title}
            fill
            className="object-cover opacity-60"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-dark to-[#1a1510]">
             <span className="font-serif text-2xl tracking-widest text-brand-gold/20">MISE</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
          {recipe.category && (
            <span className="inline-block px-3 py-1 mb-4 border border-brand-gold text-brand-gold font-mono text-xs uppercase tracking-widest rounded-full backdrop-blur-sm bg-black/30">
              {recipe.category}
            </span>
          )}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-4 drop-shadow-lg">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="font-mono text-brand-cream/80 max-w-2xl text-sm md:text-base leading-relaxed">
              {recipe.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-brand-gold/10 bg-brand-dark/50 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-wrap items-center gap-8 font-mono text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-cream/60 uppercase text-xs">Prep</span>
            <span>{recipe.prep_time || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-cream/60 uppercase text-xs">Cook</span>
            <span>{recipe.cook_time || "-"}</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Users className="w-4 h-4 text-brand-gold" />
            <div className="flex items-center gap-3 bg-black/40 rounded-full border border-brand-gold/20 px-3 py-1">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="text-brand-cream/50 hover:text-brand-gold transition-colors"
              >-</button>
              <span className="w-4 text-center">{servings}</span>
              <button
                onClick={() => setServings(servings + 1)}
                className="text-brand-cream/50 hover:text-brand-gold transition-colors"
              >+</button>
            </div>
            <span className="text-brand-cream/60 uppercase text-xs">Servings</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Ingredients Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="sticky top-40">
            <h2 className="font-serif text-3xl text-brand-gold mb-6 flex items-center justify-between border-b border-brand-gold/20 pb-4">
              Ingredients
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing: {id: string; amount: string; name: string}) => {
                const isChecked = checkedIngredients.has(ing.id);
                return (
                  <li
                    key={ing.id}
                    className={`flex items-start gap-4 cursor-pointer group transition-all duration-300 ${isChecked ? 'opacity-40' : 'opacity-100'}`}
                    onClick={() => toggleIngredient(ing.id)}
                  >
                    <div className={`mt-1 w-4 h-4 rounded-sm border flex-shrink-0 transition-colors ${isChecked ? 'bg-brand-gold border-brand-gold' : 'border-brand-gold/50 group-hover:border-brand-gold'}`} />
                    <div className="font-mono text-sm leading-relaxed">
                      {ing.amount && (
                        <span className={`font-bold mr-2 text-brand-gold ${isChecked ? 'line-through' : ''}`}>
                          {parseAmount(ing.amount)}
                        </span>
                      )}
                      <span className={isChecked ? 'line-through' : ''}>{ing.name}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Method */}
        <div className="lg:col-span-8 space-y-12">
          <div>
            <h2 className="font-serif text-3xl text-brand-gold mb-8 border-b border-brand-gold/20 pb-4">
              Method
            </h2>
            <div className="space-y-8">
              {recipe.steps.map((step: {id: string; text: string; time_label: string}, idx: number) => {
                const isCompleted = completedSteps.has(step.id);
                return (
                  <div
                    key={step.id}
                    className={`relative pl-8 transition-opacity duration-500 ${isCompleted ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full border border-brand-gold/30 hover:bg-brand-gold/10 hover:border-brand-gold transition-colors z-10 bg-brand-dark text-brand-gold text-xs font-mono"
                    >
                      {idx + 1}
                    </button>
                    {idx !== recipe.steps.length - 1 && (
                      <div className="absolute left-3 top-7 bottom-[-2rem] w-[1px] bg-brand-gold/10" />
                    )}

                    <div
                      className="cursor-pointer"
                      onClick={() => toggleStep(step.id)}
                    >
                      {step.time_label && (
                        <span className="inline-block px-2 py-1 mb-2 bg-brand-gold/10 text-brand-gold text-xs font-mono uppercase tracking-wider rounded">
                          {step.time_label}
                        </span>
                      )}
                      <p className="font-serif text-xl leading-relaxed text-brand-cream/90">
                        {step.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes / Comments */}
          <div className="pt-12 mt-12 border-t border-brand-gold/10">
            <h3 className="font-serif text-2xl text-brand-gold mb-6">Chef&apos;s Notes</h3>

            <form onSubmit={handleAddComment} className="mb-8 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note about modifications, pairings, or results..."
                className="w-full bg-black/40 border border-brand-gold/20 rounded-lg p-4 font-mono text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-gold resize-y min-h-[100px]"
              />
              <div className="absolute bottom-4 right-4">
                <Button type="submit" size="sm">Post Note</Button>
              </div>
            </form>

            <div className="space-y-6">
              {comments.map((comment: {id: string; text: string; created_at: string}) => (
                <div key={comment.id} className="bg-black/20 border border-brand-gold/10 p-4 rounded-lg">
                  <p className="font-mono text-sm text-brand-cream/80 whitespace-pre-wrap leading-relaxed">
                    {comment.text}
                  </p>
                  <p className="text-xs font-mono text-brand-cream/40 mt-3 text-right">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
