"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { TrendingUp, Receipt, Layers3 } from "lucide-react";

export default function SalesReport() {
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const iso = today.toISOString();

    const { data: peds, error: errP } = await supabase
      .from("pedidos")
      .select("*")
      .eq("pagado", true)
      .gte("creado_at", iso);

    const { data: items, error: errI } = await supabase.from("platos").select("*");
    const { data: cats, error: errC } = await supabase.from("categorias").select("*");

    setLoading(false);

    if (errP || errI || errC) {
      toast.error("Error cargando reportes");
      return;
    }

    setPedidos(peds ?? []);
    setPlatos(items ?? []);
    setCategorias(cats ?? []);
  }

  const totalHoy = useMemo(() => {
    return pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
  }, [pedidos]);

  const numOrdenes = useMemo(() => pedidos.length, [pedidos]);

  const ventasPorCategoria = useMemo(() => {
    const mapPlato = new Map(platos.map((p) => [p.id, p]));
    const mapCat = new Map(categorias.map((c) => [c.id, c.nombre]));

    const totals = {};

    for (const pedido of pedidos) {
      const items = pedido.items ?? [];
      for (const it of items) {
        const plato = mapPlato.get(it.id);
        const catName = mapCat.get(plato?.categoria_id) ?? "Sin categoría";
        const val = Number(it.precio || 0) * Number(it.cantidad || 0);
        totals[catName] = (totals[catName] ?? 0) + val;
      }
    }

    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [pedidos, platos, categorias]);

  return (
    <div className="min-h-[calc(100vh-120px)] rounded-3xl bg-zinc-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Reportes
          </h2>
          <p className="text-sm text-zinc-500">
            Ventas de hoy (solo pedidos pagados)
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-100"
        >
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl sm:col-span-2" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Total */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-500">
                Total recaudado hoy
              </p>

              <div className="rounded-2xl bg-orange-50 p-2 text-orange-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-zinc-900">
              ${totalHoy.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Suma de pedidos marcados como pagados.
            </p>
          </div>

          {/* Órdenes */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-500">
                Número de órdenes
              </p>

              <div className="rounded-2xl bg-green-50 p-2 text-green-700">
                <Receipt className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-zinc-900">{numOrdenes}</p>

            <p className="mt-1 text-xs text-zinc-500">
              Cantidad total de pedidos pagados hoy.
            </p>
          </div>

          {/* Ventas por categoría */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-900">
                  Ventas por categoría
                </p>
                <p className="text-sm text-zinc-500">
                  Ordenado de mayor a menor
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-2 text-zinc-700">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {ventasPorCategoria.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                  No hay ventas hoy.
                </div>
              ) : (
                ventasPorCategoria.map(([cat, val]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-zinc-800">
                      {cat}
                    </span>

                    <span className="rounded-xl bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">
                      ${val.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}