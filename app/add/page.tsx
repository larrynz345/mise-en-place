"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Link as LinkIcon, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AddRecipePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"paste" | "pinterest">("paste");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [recipeText, setRecipeText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to add a recipe.");
      }

      let photoUrl = "";
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload-photo", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Failed to upload photo");
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.url;
      }

      const parseRes = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: recipeText,
          url: sourceUrl,
        }),
      });
      if (!parseRes.ok) throw new Error("Failed to parse recipe");
      const parsedRecipe = await parseRes.json();

      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          user_id: user.id,
          title: parsedRecipe.title,
          description: parsedRecipe.description,
          category: parsedRecipe.category,
          prep_time: parsedRecipe.prepTime,
          cook_time: parsedRecipe.cookTime,
          servings: parsedRecipe.servings,
          source: sourceUrl ? new URL(sourceUrl).hostname : "Manual",
          source_url: sourceUrl,
          photo_url: photoUrl,
          tags: parsedRecipe.tags,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      if (parsedRecipe.ingredients?.length > 0) {
        const ingredientsToInsert = parsedRecipe.ingredients.map((ing: {amount: string, name: string}, idx: number) => ({
          recipe_id: recipe.id,
          amount: ing.amount,
          name: ing.name,
          order_index: idx,
        }));
        await supabase.from("ingredients").insert(ingredientsToInsert);
      }

      if (parsedRecipe.steps?.length > 0) {
        const stepsToInsert = parsedRecipe.steps.map((step: {text: string, timeLabel: string | null}, idx: number) => ({
          recipe_id: recipe.id,
          text: step.text,
          time_label: step.timeLabel,
          order_index: idx,
        }));
        await supabase.from("steps").insert(stepsToInsert);
      }

      router.push(`/recipe/${recipe.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        setError(err.message || "An error occurred while saving the recipe.");
      } else {
        setError("An error occurred while saving the recipe.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-serif text-4xl text-brand-gold mb-8">Add a New Recipe</h1>

      <div className="flex border-b border-brand-gold/20 mb-8">
        <button
          className={`px-4 py-2 font-mono text-sm uppercase tracking-wider transition-colors ${
            activeTab === "paste"
              ? "text-brand-gold border-b-2 border-brand-gold"
              : "text-brand-cream/50 hover:text-brand-cream/80"
          }`}
          onClick={() => setActiveTab("paste")}
        >
          Paste Recipe
        </button>
        <button
          className={`px-4 py-2 font-mono text-sm uppercase tracking-wider transition-colors ${
            activeTab === "pinterest"
              ? "text-brand-gold border-b-2 border-brand-gold"
              : "text-brand-cream/50 hover:text-brand-cream/80"
          }`}
          onClick={() => setActiveTab("pinterest")}
        >
          Pinterest Import
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-mono text-brand-cream/70 uppercase">
            Cover Photo
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-brand-gold bg-brand-gold/5"
                : "border-brand-gold/20 bg-black/20 hover:border-brand-gold/40 hover:bg-black/40"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <p className="font-mono text-brand-cream">{file.name}</p>
            ) : (
              <div className="flex flex-col items-center text-brand-cream/50">
                <UploadCloud className="h-10 w-10 mb-4 stroke-1" />
                <p className="font-mono text-sm">Drag & drop an image, or click to select</p>
                <p className="font-mono text-xs mt-2 opacity-50">JPEG, PNG up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {activeTab === "pinterest" && (
          <div className="space-y-2">
            <label className="block text-sm font-mono text-brand-cream/70 uppercase">
              Pinterest URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gold/50" />
              <Input
                type="url"
                placeholder="https://pinterest.com/pin/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-mono text-brand-cream/70 uppercase">
            {activeTab === "pinterest" ? "Paste text from Pin (if needed)" : "Recipe Text"}
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-brand-gold/50" />
            <textarea
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Paste the full recipe text here (ingredients, instructions, etc)..."
              className="w-full min-h-[300px] rounded-md border border-brand-gold/20 bg-black/40 pl-10 py-2 pr-3 text-sm font-mono text-brand-cream placeholder:text-brand-cream/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold resize-y"
              required={activeTab === "paste"}
            />
          </div>
          <p className="text-xs font-mono text-brand-cream/40 mt-2">
            Our AI will automatically extract the title, ingredients, steps, and timings.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm font-mono text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-brand-gold/20">
          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Processing Recipe..." : "Save to MISE / en place"}
          </Button>
        </div>
      </form>
    </div>
  );
}
