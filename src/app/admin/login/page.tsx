"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home as HomeIcon, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#C49D83] p-2 rounded-lg">
            <HomeIcon className="w-6 h-6 text-[#f5efe6]" />
          </div>
          <span className="font-serif font-bold text-xl text-[#C49D83]">ImmoAdmin</span>
        </div>
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md border border-[#D5CABC]/30 shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-2 bg-[#C49D83]"></div>
        <CardHeader className="space-y-1 pt-8 text-center">
          <CardTitle className="text-3xl font-serif font-bold text-[#C49D83]">Bienvenue</CardTitle>
          <CardDescription className="text-[#BDA18A] font-medium">
            Connectez-vous pour gérer vos biens immobiliers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#BDA18A] ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BDA18A]" />
                <Input
                  type="email"
                  placeholder="admin@exemple.com"
                  className="pl-12 h-14 bg-white border-[#D5CABC]/50 focus:border-[#C49D83] rounded-2xl shadow-sm transition-all focus:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#BDA18A] ml-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BDA18A]" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-14 bg-white border-[#D5CABC]/50 focus:border-[#C49D83] rounded-2xl shadow-sm transition-all focus:ring-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#C49D83] hover:bg-[#BDA18A] text-[#f5efe6] rounded-2xl font-bold text-lg shadow-lg shadow-[#C49D83]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>
        <div className="p-6 bg-[#f5efe6]/30 text-center">
          <p className="text-xs text-[#BDA18A] font-medium uppercase tracking-widest">
            Accès sécurisé réservé aux administrateurs
          </p>
        </div>
      </Card>
    </div>
  );
}
