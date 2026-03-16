"use client";

import Image from "next/image";

export function RecipeCardView({ recipe }: { recipe: {
  title: string;
  category?: string;
  description?: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  photo_url?: string;
  ingredients: {id: string; amount: string; name: string}[];
  steps: {id: string; text: string; time_label: string}[];
} }) {
  return (
    <div className="bg-[#f4ebd8] min-h-screen text-stone-900 font-serif pb-24 print:bg-white print:pb-0">

      <div className="max-w-4xl mx-auto py-8 px-4 flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-stone-800 text-[#f4ebd8] px-6 py-2 rounded shadow-md hover:bg-stone-900 transition-colors font-mono text-sm uppercase tracking-wider"
        >
          Print Recipe Card
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-[#fdfbf7] shadow-xl border border-stone-200 overflow-hidden relative print:shadow-none print:border-none print:max-w-none print:w-full">

        <div className="absolute top-0 bottom-0 left-8 md:left-12 w-[2px] bg-red-400/40 z-0" />

        <div className="absolute top-0 left-0 right-0 h-32 border-b-[2px] border-blue-400/20 z-0 pointer-events-none space-y-8 pt-8">
          <div className="h-[2px] bg-blue-400/20 w-full" />
          <div className="h-[2px] bg-blue-400/20 w-full" />
          <div className="h-[2px] bg-blue-400/20 w-full" />
        </div>

        <div className="relative z-10 pt-10 pb-16 px-12 md:px-20">

          <div className="flex flex-col md:flex-row items-start gap-8 border-b-2 border-stone-800 pb-8 mb-8">
            {recipe.photo_url && (
              <div className="relative w-48 h-48 flex-shrink-0 border-4 border-white shadow-md rotate-[-2deg]">
                <Image
                  src={recipe.photo_url}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              {recipe.category && (
                <span className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-2 block">
                  {recipe.category}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-stone-900 print:text-black">
                {recipe.title}
              </h1>

              <div className="flex flex-wrap gap-6 font-mono text-sm text-stone-600 mb-6">
                {recipe.prep_time && (
                  <div><span className="uppercase text-xs font-bold text-stone-400 mr-2">Prep</span> {recipe.prep_time}</div>
                )}
                {recipe.cook_time && (
                  <div><span className="uppercase text-xs font-bold text-stone-400 mr-2">Cook</span> {recipe.cook_time}</div>
                )}
                {recipe.servings && (
                  <div><span className="uppercase text-xs font-bold text-stone-400 mr-2">Yield</span> {recipe.servings}</div>
                )}
              </div>

              {recipe.description && (
                <p className="text-stone-700 italic leading-relaxed">
                  {recipe.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

            <div className="md:col-span-4">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6 pb-2 border-b border-stone-300">
                Ingredients
              </h2>
              <ul className="space-y-3 font-mono text-sm">
                {recipe.ingredients.map((ing: {id: string; amount: string; name: string}) => (
                  <li key={ing.id} className="leading-snug break-inside-avoid">
                    {ing.amount && <span className="font-bold mr-2">{ing.amount}</span>}
                    {ing.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-8">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6 pb-2 border-b border-stone-300">
                Directions
              </h2>
              <div className="space-y-6">
                {recipe.steps.map((step: {id: string; text: string; time_label: string}, idx: number) => (
                  <div key={step.id} className="flex gap-4 break-inside-avoid">
                    <span className="font-bold text-stone-400 font-mono mt-1">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <div>
                      {step.time_label && (
                        <span className="block font-mono text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                          {step.time_label}
                        </span>
                      )}
                      <p className="text-lg leading-relaxed text-stone-800">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-stone-300 text-center font-mono text-xs text-stone-400">
            MISE / en place — {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
