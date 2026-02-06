"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LoginScreen from "@/components/auth/LoginScreen";
import WaiterPanel from "@/components/modules/WaiterPanel";
import CashierMonitor from "@/components/modules/CashierMonitor";
import AdminInventory from "@/components/modules/AdminInventory";
import SalesReport from "@/components/modules/SalesReport";
import { toast } from "sonner";

import {
  ShoppingCart,
  CreditCard,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function HomePage() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("mesero");
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadSession() {
      setLoadingSession(true);
      const { data } = await supabase.auth.getSession();
      if (!ignore) {
        setSession(data.session ?? null);
        setLoadingSession(false);
      }
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      ignore = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const userEmail = useMemo(() => session?.user?.email ?? "", [session]);
  const meseroId = useMemo(() => session?.user?.id ?? null, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-300">
        Cargando...
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">FastFood</h1>
            <p className="text-xs text-zinc-400">{userEmail}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm hover:bg-zinc-50"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        {activeTab === "mesero" && <WaiterPanel meseroId={meseroId} />}
        {activeTab === "caja" && <CashierMonitor />}
        {activeTab === "admin" && <AdminInventory />}
        {activeTab === "reportes" && <SalesReport />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-1 px-3 py-2">
          <TabButton
            active={activeTab === "mesero"}
            onClick={() => setActiveTab("mesero")}
            label="Pedidos"
            icon={<ShoppingCart className="h-5 w-5" />}
            accent="orange"
          />
          <TabButton
            active={activeTab === "caja"}
            onClick={() => setActiveTab("caja")}
            label="Caja"
            icon={<CreditCard className="h-5 w-5" />}
            accent="orange"
          />
          <TabButton
            active={activeTab === "admin"}
            onClick={() => setActiveTab("admin")}
            label="Admin"
            icon={<Settings className="h-5 w-5" />}
            accent="orange"
          />
          <TabButton
            active={activeTab === "reportes"}
            onClick={() => setActiveTab("reportes")}
            label="Reportes"
            icon={<BarChart3 className="h-5 w-5" />}
            accent="orange"
          />
        </div>
      </nav>
    </div>
  );
}

function TabButton({ active, onClick, label, icon, accent = "orange" }) {
  const accentClass =
    accent === "green"
      ? "text-green-400"
      : accent === "orange"
        ? "text-orange-400"
        : "text-zinc-200";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs transition ${
        active ? "bg-zinc-900/70" : "bg-transparent hover:bg-zinc-900/30"
      }`}
    >
      <div className={`${active ? accentClass : "text-zinc-400"}`}>{icon}</div>
      <span className={`${active ? "text-zinc-100" : "text-zinc-500"}`}>
        {label}
      </span>
    </button>
  );
}
