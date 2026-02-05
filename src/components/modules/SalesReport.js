
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "sonner";

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
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Reportes</h2>
        <p className="text-sm text-zinc-400">
          Ventas de hoy (solo pedidos pagados)
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-56 w-full sm:col-span-2" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-xl">
            <p className="text-sm text-zinc-400">Total recaudado hoy</p>
            <p className="mt-2 text-3xl font-semibold text-orange-400">
              ${totalHoy.toFixed(2)}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-xl">
            <p className="text-sm text-zinc-400">Número de órdenes</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-100">{numOrdenes}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-xl sm:col-span-2">
            <p className="text-sm font-semibold">Ventas por categoría</p>
            <div className="mt-4 space-y-2">
              {ventasPorCategoria.length === 0 ? (
                <p className="text-sm text-zinc-400">No hay ventas hoy.</p>
              ) : (
                ventasPorCategoria.map(([cat, val]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3"
                  >
                    <span className="text-sm text-zinc-200">{cat}</span>
                    <span className="text-sm font-semibold text-orange-400">
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