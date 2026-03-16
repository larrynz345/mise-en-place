"use client";

import Link from "next/link";
import { Button } from "./ui/Button";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { LogOut, Plus, Settings, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-brand-gold/10 bg-brand-dark/80 backdrop-blur supports-[backdrop-filter]:bg-brand-dark/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-brand-gold">
            MISE <span className="text-brand-cream/50 font-normal">/ en place</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/add">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Recipe
                </Button>
                <Button variant="outline" size="icon" className="sm:hidden">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="text-brand-cream/70 hover:text-brand-gold">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-brand-cream/70 hover:text-brand-gold"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="default" size="sm">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
