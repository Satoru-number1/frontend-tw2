import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Calendar,
  X,
  Trash2,
  Edit3,
  ClipboardList,
} from "lucide-react";
import api from "../../../services/api";

interface ProvidersViewProps {
  triggerToast: (msg: string) => void;
}

interface Provider {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  relacion: string;
  codigoProveedor: string;
  estado: number;
}

interface Pedido {
  id: number;
  productoNombre: string;
  cantidad: number;
  fechaEntrega: string;
  descripcion: string;
  total: number;
  unidades: string;
}

export default function ProvidersView({ triggerToast }: ProvidersViewProps) {
  const [providerSearch, setProviderSearch] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [historyOrders, setHistoryOrders] = useState<Pedido[]>([]);

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [relacion, setRelacion] = useState("");
  const [codigoProveedor, setCodigoProveedor] = useState("");
  const [estado, setEstado] = useState(0);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/Proveedores");
      setProviders(response.data || []);
    } catch (err) {
      triggerToast("Error al cargar la lista de proveedores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !codigoProveedor || !telefono) {
      triggerToast("Nombre, Código y Teléfono son requeridos.");
      return;
    }

    setIsSubmitLoading(true);
    try {
      await api.post("/Proveedores", {
        nombre,
        direccion,
        telefono,
        relacion,
        codigoProveedor,
      });
      triggerToast("Proveedor registrado con éxito.");
      setShowAddModal(false);

      setNombre("");
      setDireccion("");
      setTelefono("");
      setRelacion("");
      setCodigoProveedor("");

      fetchProviders();
    } catch (err: any) {
      triggerToast(
        err.response?.data?.mensaje || "Error al crear el proveedor.",
      );
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setIsSubmitLoading(true);
    try {
      await api.put(`/Proveedores/${selectedProvider.codigoProveedor}`, {
        nombre,
        direccion,
        telefono,
        relacion,
        estado,
      });
      triggerToast("Proveedor actualizado con éxito.");
      setShowEditModal(false);
      fetchProviders();
    } catch (err: any) {
      triggerToast(
        err.response?.data?.mensaje || "Error al actualizar el proveedor.",
      );
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (codigo: string) => {
    if (!window.confirm("¿Está seguro de eliminar este proveedor?")) return;

    try {
      await api.delete(`/Proveedores/${codigo}`);
      triggerToast("Proveedor eliminado con éxito.");
      fetchProviders();
    } catch (err: any) {
      triggerToast(
        err.response?.data?.mensaje || "Error al eliminar el proveedor.",
      );
    }
  };

  const handleViewHistory = async (prov: Provider) => {
    setSelectedProvider(prov);
    setIsLoading(true);
    try {
      const response = await api.get(
        `/Proveedores/${prov.codigoProveedor}/historial-pedidos`,
      );
      const data = response.data || {};
      setHistoryOrders(data.pedidos || []);
      setShowHistoryModal(true);
    } catch (err) {
      triggerToast("Error al cargar el historial de pedidos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex justify-between items-center gap-4 select-none">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={providerSearch}
            onChange={(e) => setProviderSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 py-2 px-4 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-lg shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850/50 border-b border-neutral-200/60 dark:border-neutral-800/60 text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Código</th>
                <th className="py-3.5 px-5">Nombre</th>
                <th className="py-3.5 px-5">Contacto / Productos</th>
                <th className="py-3.5 px-5">Teléfono</th>
                <th className="py-3.5 px-5">Estado</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-neutral-400"
                  >
                    Cargando proveedores...
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-neutral-400"
                  >
                    No se encontraron proveedores.
                  </td>
                </tr>
              ) : (
                providers
                  .filter(
                    (p) =>
                      p.nombre
                        .toLowerCase()
                        .includes(providerSearch.toLowerCase()) ||
                      p.codigoProveedor
                        .toLowerCase()
                        .includes(providerSearch.toLowerCase()),
                  )
                  .map((prov) => (
                    <tr
                      key={prov.id}
                      className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors text-neutral-800 dark:text-neutral-200"
                    >
                      <td className="py-3.5 px-5 font-mono text-[12px]">
                        {prov.codigoProveedor}
                      </td>
                      <td className="py-3.5 px-5 font-bold">{prov.nombre}</td>
                      <td className="py-3.5 px-5 text-neutral-550 dark:text-neutral-450">
                        {prov.relacion || "Sin detalles"}
                      </td>
                      <td className="py-3.5 px-5 font-mono">{prov.telefono}</td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                            prov.estado === 0
                              ? "border-neutral-300 text-neutral-500"
                              : "bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          {prov.estado === 0 ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleViewHistory(prov)}
                          className="py-1 px-2.5 border border-neutral-350 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Pedidos</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProvider(prov);
                            setNombre(prov.nombre);
                            setDireccion(prov.direccion);
                            setTelefono(prov.telefono);
                            setRelacion(prov.relacion);
                            setEstado(prov.estado);
                            setShowEditModal(true);
                          }}
                          className="py-1 px-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prov.codigoProveedor)}
                          className="py-1 px-2 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white">
                Registrar Proveedor
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Código de Proveedor *
                </label>
                <input
                  type="text"
                  required
                  value={codigoProveedor}
                  onChange={(e) => setCodigoProveedor(e.target.value)}
                  placeholder="PROV-LACTEOS"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="PIL Andina S.A."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Teléfono *
                </label>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="70012345"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Dirección
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Av. Blanco Galindo Km 5"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Productos / Relación de Suministro
                </label>
                <input
                  type="text"
                  value={relacion}
                  onChange={(e) => setRelacion(e.target.value)}
                  placeholder="Lácteos, quesos y mantequillas"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white">
                Modificar Proveedor
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Teléfono *
                </label>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Dirección
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Productos / Relación de Suministro
                </label>
                <input
                  type="text"
                  value={relacion}
                  onChange={(e) => setRelacion(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                >
                  <option value={0}>Activo</option>
                  <option value={1}>Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitLoading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-2xl w-full p-6 flex flex-col gap-4 max-h-[85vh]">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-[15px] font-bold text-neutral-900 dark:text-white">
                  Historial de Abastecimiento
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">
                  Proveedor: {selectedProvider.nombre} (
                  {selectedProvider.codigoProveedor})
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              {historyOrders.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 select-none">
                  No hay registros de pedidos de abastecimiento para este
                  proveedor.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {historyOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl flex justify-between items-start gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-bold text-neutral-900 dark:text-white">
                          {order.productoNombre}
                        </span>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(
                            order.fechaEntrega,
                          ).toLocaleDateString()}{" "}
                          {new Date(order.fechaEntrega).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <p className="text-[11px] text-neutral-500 italic mt-1">
                          "{order.descripcion || "Sin descripción"}"
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="text-[13px] font-black text-neutral-900 dark:text-white">
                          Bs {order.total.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-semibold text-neutral-550">
                          {order.cantidad} unidades
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            order.unidades === "Bueno"
                              ? "bg-green-500/10 text-green-600 border border-green-200/25"
                              : order.unidades === "Vencido"
                                ? "bg-red-500/10 text-red-500 border border-red-200/25"
                                : "bg-amber-500/10 text-amber-600 border border-amber-200/25"
                          }`}
                        >
                          Estado: {order.unidades}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="py-2 px-5 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
