"use client";

import { useState } from "react";
import { CinematicView } from "./CinematicView";
import { RecipeCardView } from "./RecipeCardView";
import { List, MonitorPlay } from "lucide-react";

export function RecipeClientViews({ recipe }: { recipe: {
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
  const [view, setView] = useState<"cinematic" | "card">("cinematic");

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex gap-2 p-2 rounded-full bg-brand-dark/80 backdrop-blur-md border border-brand-gold/20 shadow-xl print:hidden">
        <button
          onClick={() => setView("cinematic")}
          className={`p-3 rounded-full transition-all ${
            view === "cinematic"
              ? "bg-brand-gold text-brand-dark"
              : "text-brand-cream/50 hover:text-brand-gold hover:bg-black/40"
          }`}
          title="Cinematic View"
        >
          <MonitorPlay className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView("card")}
          className={`p-3 rounded-full transition-all ${
            view === "card"
              ? "bg-brand-gold text-brand-dark"
              : "text-brand-cream/50 hover:text-brand-gold hover:bg-black/40"
          }`}
          title="Recipe Card View"
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      {view === "cinematic" ? (
        <CinematicView recipe={recipe} />
      ) : (
        <RecipeCardView recipe={recipe} />
      )}
    </>
  );
}
