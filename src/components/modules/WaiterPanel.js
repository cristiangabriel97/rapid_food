
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import { Plus, Minus, Trash2, NotebookPen, Send } from "lucide-react";

export default function WaiterPanel({ meseroId }) {
  const [categorias, setCategorias] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategoria, setActiveCategoria] = useState(null);

  const [cart, setCart] = useState([]);
  const [tipoServicio, setTipoServicio] = useState("");

  const [sending, setSending] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);

      const { data: cats, error: errCats } = await supabase
        .from("categorias")
        .select("*")
        .order("nombre");

      const { data: items, error: errItems } = await supabase
        .from("platos")
        .select("*")
        .eq("disponible", true)
        .order("nombre");

      if (!ignore) {
        if (errCats || errItems) {
          toast.error("Error cargando menú");
        } else {
          setCategorias(cats ?? []);
          setPlatos(items ?? []);
          setActiveCategoria(cats?.[0]?.id ?? null);
        }
        setLoading(false);
      }
    }

    load();
    return () => (ignore = true);
  }, []);

  const platosFiltrados = useMemo(() => {
    if (!activeCategoria) return [];
    return platos.filter((p) => p.categoria_id === activeCategoria);
  }, [platos, activeCategoria]);

  const total = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  }, [cart]);

  function addToCart(plato) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.id === plato.id && x.observaciones === "");
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].cantidad += 1;
        return copy;
      }
      return [
        ...prev,
        {
          id: plato.id,
          nombre: plato.nombre,
          cantidad: 1,
          precio: plato.precio,
          observaciones: "",
        },
      ];
    });
  }

  function updateQty(index, delta) {
    setCart((prev) => {
      const copy = [...prev];
      copy[index].cantidad += delta;
      if (copy[index].cantidad <= 0) copy.splice(index, 1);
      return copy;
    });
  }

  function updateObs(index, value) {
    setCart((prev) => {
      const copy = [...prev];
      copy[index].observaciones = value;
      return copy;
    });
  }

  function removeItem(index) {
    setCart((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }

  async function sendOrder() {
    if (!tipoServicio) {
      toast.error("Selecciona el tipo de servicio");
      return;
    }
    if (cart.length === 0) {
      toast.error("Carrito vacío");
      return;
    }

    setSending(true);

    const payload = {
      mesero_id: meseroId,
      items: cart,
      total,
      tipo_servicio: tipoServicio,
      pagado: false,
    };

    const { error } = await supabase.from("pedidos").insert(payload);

    setSending(false);

    if (error) {
      toast.error("No se pudo enviar el pedido", { description: error.message });
      return;
    }

    toast.success("Pedido enviado a caja", {
      description: "Se registró correctamente.",
    });

    setCart([]);
    setTipoServicio("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Menú */}
      <div className="lg:col-span-2">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Menú</h2>
          <p className="text-sm text-zinc-400">
            Selecciona una categoría y agrega productos al pedido.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {loading ? (
            <>
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </>
          ) : (
            categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategoria(c.id)}
                className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm transition ${
                  activeCategoria === c.id
                    ? "bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20"
                    : "border border-zinc-800 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                {c.nombre}
              </button>
            ))
          )}
        </div>

        {/* Items */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            : platosFiltrados.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 text-left shadow-sm transition hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{p.nombre}</p>
                      <p className="mt-1 text-xs text-zinc-400">{p.descripcion}</p>
                    </div>
                    <div className="rounded-xl bg-zinc-950 px-3 py-1 text-sm font-semibold text-orange-400">
                      ${Number(p.precio).toFixed(2)}
                    </div>
                  </div>
                </button>
              ))}
        </div>
      </div>

      {/* Carrito */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-xl">
        <h3 className="text-lg font-semibold">Pedido</h3>
        <p className="text-xs text-zinc-400">Carrito del mesero</p>

        <div className="mt-4 space-y-3">
          {cart.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-400">
              No hay items agregados.
            </div>
          ) : (
            cart.map((it, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{it.nombre}</p>
                    <p className="text-xs text-zinc-400">
                      ${Number(it.precio).toFixed(2)} c/u
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(idx)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-300 hover:bg-zinc-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Cantidad */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(idx, -1)}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 hover:bg-zinc-900"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">
                      {it.cantidad}
                    </span>
                    <button
                      onClick={() => updateQty(idx, 1)}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 hover:bg-zinc-900"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-orange-400">
                    ${(it.precio * it.cantidad).toFixed(2)}
                  </div>
                </div>

                {/* Observaciones */}
                <div className="mt-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
                    <NotebookPen className="h-4 w-4" />
                    Observaciones
                  </div>
                  <input
                    value={it.observaciones}
                    onChange={(e) => updateObs(idx, e.target.value)}
                    placeholder="Ej: sin cebolla, sin hielo..."
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tipo Servicio */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Tipo de servicio</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTipoServicio("local")}
              className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                tipoServicio === "local"
                  ? "bg-orange-500 text-zinc-950"
                  : "border border-zinc-800 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              Para comer aquí
            </button>
            <button
              onClick={() => setTipoServicio("llevar")}
              className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                tipoServicio === "llevar"
                  ? "bg-orange-500 text-zinc-950"
                  : "border border-zinc-800 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              Para llevar
            </button>
          </div>
        </div>

        {/* Total + Send */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
            <span className="text-sm text-zinc-300">Total</span>
            <span className="text-lg font-semibold text-orange-400">
              ${total.toFixed(2)}
            </span>
          </div>

          <button
            disabled={sending}
            onClick={sendOrder}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-orange-500/20 hover:bg-orange-400 disabled:opacity-60"
          >
            {sending ? <Spinner /> : <Send className="h-4 w-4" />}
            Enviar a Caja
          </button>
        </div>
      </div>
    </div>
  );
}