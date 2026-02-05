
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import { Lock, Mail } from "lucide-react";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error("Error al iniciar sesión", { description: error.message });
      return;
    }

    toast.success("Bienvenido 👋", { description: "Sesión iniciada correctamente" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">FastFood</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Acceso al sistema 
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Correo</label>
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 py-3">
                <Mail className="h-5 w-5 text-zinc-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="empleado@restaurante.com"
                  type="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Contraseña</label>
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 py-3">
                <Lock className="h-5 w-5 text-zinc-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:opacity-60"
            >
              {loading ? <Spinner /> : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 text-xs text-zinc-400">
            Tip: Usa usuarios creados en Supabase Auth.
          </div>
        </div>
      </div>
    </div>
  );
}