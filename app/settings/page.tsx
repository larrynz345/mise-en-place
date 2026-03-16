import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/Button";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const isPro = profile?.subscription_tier === "pro";

  const { count: recipeCount } = await supabase
    .from("recipes")
    .select("id", { count: "exact" })
    .eq("user_id", user.id);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-serif text-4xl text-brand-gold mb-12">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-black/20 border border-brand-gold/10 p-8 rounded-xl">
            <h2 className="font-serif text-2xl text-brand-cream mb-6">Profile</h2>
            <div className="space-y-4 font-mono text-sm">
              <div>
                <p className="text-brand-cream/50 uppercase tracking-widest text-xs mb-1">Email</p>
                <p className="text-brand-cream">{user.email}</p>
              </div>
              <div>
                <p className="text-brand-cream/50 uppercase tracking-widest text-xs mb-1">Recipes Saved</p>
                <p className="text-brand-cream">{recipeCount} {isPro ? "" : "/ 10 (Free Plan)"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`border p-8 rounded-xl relative overflow-hidden ${isPro ? 'bg-brand-gold/5 border-brand-gold/40' : 'bg-black/20 border-brand-gold/10'}`}>
            {isPro && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-bl-full blur-2xl" />
            )}
            <h2 className="font-serif text-2xl text-brand-cream mb-2 flex items-center gap-3">
              <CreditCard className="text-brand-gold" />
              Subscription
            </h2>
            <div className="mt-6 mb-8">
              <span className="inline-block px-3 py-1 bg-brand-gold text-brand-dark font-mono text-xs uppercase tracking-widest font-bold rounded">
                {isPro ? "Mise Pro" : "Free Plan"}
              </span>
            </div>
            <ul className="space-y-3 font-mono text-sm text-brand-cream/80 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>{isPro ? "Unlimited recipes" : "Up to 10 recipes"}</span>
              </li>
              <li className={`flex items-start gap-2 ${isPro ? '' : 'opacity-40'}`}>
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>AI Recipe Parsing (from text/Pinterest)</span>
              </li>
              <li className={`flex items-start gap-2 ${isPro ? '' : 'opacity-40'}`}>
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>Photo Uploads</span>
              </li>
            </ul>
            {!isPro && (
              <form action="/api/stripe/checkout" method="POST">
                <Button type="submit" className="w-full">
                  Upgrade to Pro — $9/mo
                </Button>
              </form>
            )}
            {isPro && (
              <div className="text-xs font-mono text-brand-cream/50 mt-4 border-t border-brand-gold/20 pt-4">
                You are currently subscribed to Mise Pro. Manage your billing details in the Stripe customer portal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
