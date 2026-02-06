
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import {
  Plus,
  Save,
  Trash2,
  Package,
  Tags,
  Search,
  Filter,
} from "lucide-react";

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

  // extras para UI moderna
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  async function load() {
    setLoading(true);

    const { data: cats } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre");

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

    toast.success("Producto creado");
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
    toast.success("Producto eliminado");
    load();
  }

  const platosFiltrados = useMemo(() => {
    const s = search.trim().toLowerCase();

    return platos.filter((p) => {
      const okSearch =
        !s ||
        String(p.nombre || "").toLowerCase().includes(s) ||
        String(p.descripcion || "").toLowerCase().includes(s);

      const okCat = !catFilter || String(p.categoria_id) === String(catFilter);

      return okSearch && okCat;
    });
  }, [platos, search, catFilter]);

  return (
    <div className="min-h-[calc(100vh-120px)] rounded-3xl bg-zinc-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Panel de administración. 
          </h2>
          <p className="text-sm text-zinc-500">
            Categorías y productos del menú.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-100"
        >
          Actualizar
        </button>
      </div>

      {/* CATEGORÍAS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-orange-50 p-2 text-orange-700">
            <Tags className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Categorías</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Crear categoría */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Nueva categoría</p>
            <p className="mt-1 text-xs text-zinc-500">
              Ej: Comida, Bebidas, Combos...
            </p>

            <div className="mt-4 space-y-3">
              <input
                value={newCat.nombre}
                onChange={(e) => setNewCat((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre de categoría"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
              />

              <input
                value={newCat.icono}
                onChange={(e) => setNewCat((p) => ({ ...p, icono: e.target.value }))}
                placeholder="Icono (opcional) ej: burger"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
              />

              <button
                disabled={saving}
                onClick={createCategoria}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500 disabled:opacity-60"
              >
                {saving ? <Spinner /> : <Plus className="h-4 w-4" />}
                Crear categoría
              </button>
            </div>
          </div>

          {/* Listado categorías */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Listado de categorías</p>
            <p className="mt-1 text-xs text-zinc-500">
              Categorpias disponibles
            </p>

            <div className="mt-4 space-y-2">
              {loading ? (
                <>
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </>
              ) : categorias.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                  No hay categorías.
                </div>
              ) : (
                categorias.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {c.nombre}
                      </p>
                      <p className="text-xs text-zinc-500">{c.icono || "—"}</p>
                    </div>

                    <button
                      onClick={() => deleteCategoria(c.id)}
                      className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm transition hover:bg-zinc-100"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="mt-10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-green-50 p-2 text-green-700">
            <Package className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Productos</h3>
        </div>

        {/* Form nuevo plato */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-zinc-900">Nuevo ingreso</p>
          <p className="mt-1 text-xs text-zinc-500">
            Registra un nuevo producto del menú
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input
              value={newPlato.nombre}
              onChange={(e) => setNewPlato((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
            />

            <input
              value={newPlato.precio}
              onChange={(e) => setNewPlato((p) => ({ ...p, precio: e.target.value }))}
              placeholder="Precio (Ej: 4.50)"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
            />

            <input
              value={newPlato.descripcion}
              onChange={(e) =>
                setNewPlato((p) => ({ ...p, descripcion: e.target.value }))
              }
              placeholder="Descripción"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500 sm:col-span-2"
            />

            <select
              value={newPlato.categoria_id}
              onChange={(e) =>
                setNewPlato((p) => ({ ...p, categoria_id: e.target.value }))
              }
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500"
            >
              <option value="">Selecciona categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
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
              className="flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500 disabled:opacity-60 sm:col-span-2"
            >
              {saving ? <Spinner /> : <Save className="h-4 w-4" />}
              Guardar producto
            </button>
          </div>
        </div>

        {/* Barra de búsqueda + filtro */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm sm:max-w-md">
            <Search className="h-5 w-5 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
            <Filter className="h-5 w-5 text-zinc-400" />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-transparent text-sm text-zinc-900 outline-none"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Listado platos */}
        <div className="grid gap-4 sm:grid-cols-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-3xl" />
            ))
          ) : platosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 sm:col-span-2">
              No hay productos registrados o no coinciden con la búsqueda.
            </div>
          ) : (
            platosFiltrados.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-zinc-900">
                      {p.nombre}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {p.descripcion || "Sin descripción"}
                    </p>
                  </div>

                  <button
                    onClick={() => deletePlato(p.id)}
                    className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm transition hover:bg-zinc-100"
                    title="Eliminar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <input
                    defaultValue={p.precio}
                    onBlur={(e) =>
                      updatePlato(p.id, { precio: Number(e.target.value) })
                    }
                    className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-500"
                  />

                  <label className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      defaultChecked={p.disponible}
                      onChange={(e) =>
                        updatePlato(p.id, { disponible: e.target.checked })
                      }
                    />
                    Disponible
                  </label>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                      p.disponible
                        ? "bg-green-50 text-green-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {p.disponible ? "Disponible" : "No disponible"}
                  </span>

                  <span className="rounded-xl bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                    ${Number(p.precio || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}