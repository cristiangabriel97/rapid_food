
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import { CheckCircle2, Receipt, Clock } from "lucide-react";

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
        () => loadPedidos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function procesarPago(id) {
    setPayingId(id);

    const { error } = await supabase
      .from("pedidos")
      .update({ pagado: true })
      .eq("id", id);

    setPayingId(null);

    if (error) {
      toast.error("No se pudo procesar pago", { description: error.message });
      return;
    }

    toast.success("Pago procesado", {
      description: "Pedido marcado como pagado.",
    });

    loadPedidos();
  }

  return (
    <div className="min-h-[calc(100vh-120px)] rounded-3xl bg-zinc-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2x1 font-bold tracking-tight text-zinc-900">
            Caja
          </h2>
          <p className="text-sm text-zinc-500">
            Pedidos pendientes.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
          <Receipt className="h-4 w-4 text-orange-500" />
          Pendientes:
          <span className="font-semibold text-zinc-900">{pedidos.length}</span>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-3xl" />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-zinc-900">
            No hay pedidos pendientes 🎉
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Todo está al día. Esperando nuevos pedidos.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pedidos.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              {/* Header Card */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Pedido #{String(p.id).slice(0, 6)}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="h-4 w-4" />
                    {p.tipo_servicio === "local"
                      ? "Para comer aquí"
                      : "Para llevar"}
                  </div>
                </div>

                <div className="rounded-2xl bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                  ${Number(p.total).toFixed(2)}
                </div>
              </div>

              {/* Items */}
              <div className="mt-4 space-y-2">
                {(p.items ?? []).map((it, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2 text-sm">
                      <span className="font-semibold text-zinc-900">
                        {it.cantidad}× {it.nombre}
                      </span>

                      <span className="font-semibold text-green-700">
                        ${(it.precio * it.cantidad).toFixed(2)}
                      </span>
                    </div>

                    {it.observaciones ? (
                      <p className="mt-1 text-xs text-zinc-500">
                        <span className="font-semibold text-zinc-700">
                          Obs:
                        </span>{" "}
                        {it.observaciones}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                disabled={payingId === p.id}
                onClick={() => procesarPago(p.id)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500 disabled:opacity-60"
              >
                {payingId === p.id ? (
                  <Spinner />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Procesar Pago
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}