
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import { CheckCircle2 } from "lucide-react";

export default function CashierMonitor() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  async function loadPedidos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("pagado", false)
      .order("creado_at", { ascending: false });

    setLoading(false);

    if (error) {
      toast.error("Error cargando pedidos");
      return;
    }

    setPedidos(data ?? []);
  }

  useEffect(() => {
    loadPedidos();

    const channel = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          loadPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function procesarPago(id) {
    setPayingId(id);

    const { error } = await supabase.from("pedidos").update({ pagado: true }).eq("id", id);

    setPayingId(null);

    if (error) {
      toast.error("No se pudo procesar pago", { description: error.message });
      return;
    }

    toast.success("Pago procesado", { description: "Pedido marcado como pagado." });
    loadPedidos();
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Caja</h2>
        <p className="text-sm text-zinc-400">
          Pedidos pendientes • Actualización en tiempo real
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 text-sm text-zinc-400">
          No hay pedidos pendientes 🎉
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pedidos.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-400">
                    Pedido #{String(p.id).slice(0, 6)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Tipo:{" "}
                    <span className="text-zinc-200">
                      {p.tipo_servicio === "local" ? "Local" : "Para llevar"}
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950 px-3 py-1 text-sm font-semibold text-green-400">
                  ${Number(p.total).toFixed(2)}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {(p.items ?? []).map((it, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-3"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">
                        {it.cantidad}× {it.nombre}
                      </span>
                      <span className="text-green-400">
                        ${(it.precio * it.cantidad).toFixed(2)}
                      </span>
                    </div>
                    {it.observaciones ? (
                      <p className="mt-1 text-xs text-zinc-400">
                        Obs: {it.observaciones}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              <button
                disabled={payingId === p.id}
                onClick={() => procesarPago(p.id)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-green-500/20 hover:bg-green-400 disabled:opacity-60"
              >
                {payingId === p.id ? <Spinner /> : <CheckCircle2 className="h-4 w-4" />}
                Procesar Pago
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}