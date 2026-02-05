
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import { Plus, Save, Trash2 } from "lucide-react";

export default function AdminInventory() {
  const [categorias, setCategorias] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCat, setNewCat] = useState({ nombre: "", icono: "" });

  const [newPlato, setNewPlato] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria_id: "",
    disponible: true,
  });

  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);

    const { data: cats } = await supabase.from("categorias").select("*").order("nombre");
    const { data: items } = await supabase.from("platos").select("*").order("nombre");

    setCategorias(cats ?? []);
    setPlatos(items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCategoria() {
    if (!newCat.nombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("categorias").insert(newCat);
    setSaving(false);

    if (error) {
      toast.error("Error creando categoría", { description: error.message });
      return;
    }

    toast.success("Categoría creada");
    setNewCat({ nombre: "", icono: "" });
    load();
  }

  async function deleteCategoria(id) {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar", { description: error.message });
      return;
    }
    toast.success("Categoría eliminada");
    load();
  }

  async function createPlato() {
    if (!newPlato.nombre.trim() || !newPlato.precio || !newPlato.categoria_id) {
      toast.error("Completa nombre, precio y categoría");
      return;
    }

    setSaving(true);

    const payload = {
      ...newPlato,
      precio: Number(newPlato.precio),
    };

    const { error } = await supabase.from("platos").insert(payload);

    setSaving(false);

    if (error) {
      toast.error("Error creando plato", { description: error.message });
      return;
    }

    toast.success("Plato creado");
    setNewPlato({
      nombre: "",
      descripcion: "",
      precio: "",
      categoria_id: "",
      disponible: true,
    });
    load();
  }

  async function updatePlato(id, patch) {
    const { error } = await supabase.from("platos").update(patch).eq("id", id);
    if (error) toast.error("Error actualizando", { description: error.message });
  }

  async function deletePlato(id) {
    const { error } = await supabase.from("platos").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar", { description: error.message });
      return;
    }
    toast.success("Plato eliminado");
    load();
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold">Administrador</h2>
        <p className="text-sm text-zinc-400">Inventario • Categorías • Platos</p>
      </div>

      {/* Categorías */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Categorías</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl">
            <p className="text-sm font-semibold">Nueva categoría</p>

            <div className="mt-3 space-y-3">
              <input
                value={newCat.nombre}
                onChange={(e) => setNewCat((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre (Ej: Hamburguesas)"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
              />
              <input
                value={newCat.icono}
                onChange={(e) => setNewCat((p) => ({ ...p, icono: e.target.value }))}
                placeholder="Icono (Ej: burger)"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
              />

              <button
                disabled={saving}
                onClick={createCategoria}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-orange-400 disabled:opacity-60"
              >
                {saving ? <Spinner /> : <Plus className="h-4 w-4" />}
                Crear categoría
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl">
            <p className="text-sm font-semibold">Listado</p>

            <div className="mt-3 space-y-2">
              {loading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : categorias.length === 0 ? (
                <p className="text-sm text-zinc-400">No hay categorías.</p>
              ) : (
                categorias.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{c.nombre}</p>
                      <p className="text-xs text-zinc-500">{c.icono || "—"}</p>
                    </div>
                    <button
                      onClick={() => deleteCategoria(c.id)}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 hover:bg-zinc-900"
                    >
                      <Trash2 className="h-4 w-4 text-zinc-300" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Platos */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Platos</h3>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl">
          <p className="text-sm font-semibold">Nuevo plato</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={newPlato.nombre}
              onChange={(e) => setNewPlato((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
            />
            <input
              value={newPlato.precio}
              onChange={(e) => setNewPlato((p) => ({ ...p, precio: e.target.value }))}
              placeholder="Precio (Ej: 4.50)"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
            />
            <input
              value={newPlato.descripcion}
              onChange={(e) =>
                setNewPlato((p) => ({ ...p, descripcion: e.target.value }))
              }
              placeholder="Descripción"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-orange-500 sm:col-span-2"
            />

            <select
              value={newPlato.categoria_id}
              onChange={(e) =>
                setNewPlato((p) => ({ ...p, categoria_id: e.target.value }))
              }
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
            >
              <option value="">Selecciona categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={newPlato.disponible}
                onChange={(e) =>
                  setNewPlato((p) => ({ ...p, disponible: e.target.checked }))
                }
              />
              Disponible
            </label>

            <button
              disabled={saving}
              onClick={createPlato}
              className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-orange-400 disabled:opacity-60 sm:col-span-2"
            >
              {saving ? <Spinner /> : <Save className="h-4 w-4" />}
              Guardar plato
            </button>
          </div>
        </div>

        {/* Listado platos */}
        <div className="grid gap-4 sm:grid-cols-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))
          ) : platos.length === 0 ? (
            <p className="text-sm text-zinc-400">No hay platos registrados.</p>
          ) : (
            platos.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{p.nombre}</p>
                    <p className="mt-1 text-xs text-zinc-400">{p.descripcion}</p>
                  </div>

                  <button
                    onClick={() => deletePlato(p.id)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 hover:bg-zinc-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <input
                    defaultValue={p.precio}
                    onBlur={(e) => updatePlato(p.id, { precio: Number(e.target.value) })}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />

                  <label className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={p.disponible}
                      onChange={(e) => updatePlato(p.id, { disponible: e.target.checked })}
                    />
                    Disponible
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}