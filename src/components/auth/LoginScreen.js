"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import { Lock, Mail } from "lucide-react";
import Image from "next/image";

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

    toast.success("Bienvenido 👋", {
      description: "Sesión iniciada correctamente",
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl lg:grid-cols-2">
        
        {/* LADO IZQUIERDO - LOGO */}
        <div className="hidden items-center justify-center bg-zinc-100 p-10 lg:flex">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-3xl bg-white shadow-sm">
              <Image
                src="/logo1.png"
                alt="Logo FastFood"
                width={90}
                height={90}
                className="object-contain"
                priority
              />
            </div>

            <h2 className="text-2xl font-bold text-zinc-900">
              FastFoodEC
            </h2>
            <p className="mt-2 max-w-xs text-sm text-zinc-500">
              Sistema integral para pedidos, caja y administración del restaurante.
            </p>
          </div>
        </div>

        {/* LADO DERECHO - FORM */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Iniciar sesión
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Acceso al sistema del restaurante
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Correo
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-3 shadow-sm transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10">
                  <Mail className="h-5 w-5 text-zinc-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                    placeholder="empleado@restaurante.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Contraseña
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-3 shadow-sm transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10">
                  <Lock className="h-5 w-5 text-zinc-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-400 disabled:opacity-60"
              >
                {loading ? <Spinner /> : "Iniciar Sesión"}
              </button>
            </form>

            {/* FOOT NOTE */}
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">
              Tip: Usa usuarios creados en Supabase Auth.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}