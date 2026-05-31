import { useState, useEffect } from 'react';
import { Plus, X, CreditCard, ToggleLeft, ToggleRight, Wallet } from 'lucide-react';
import api from '../../../services/api';

interface PaymentMethodsViewProps {
  triggerToast: (msg: string) => void;
}

interface MetodoPago {
  id: number;
  nombre: string;
  descipcion: string;
  estado: string;
}

export default function PaymentMethodsView({ triggerToast }: PaymentMethodsViewProps) {
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const fetchMetodos = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/MetodoPago');
      setMetodos(response.data || []);
    } catch (err) {
      triggerToast('Error al cargar los métodos de pago.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetodos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      triggerToast('El nombre del método de pago es obligatorio.');
      return;
    }
    setIsSubmitLoading(true);
    try {
      await api.post('/MetodoPago', { nombre, descripcion });
      triggerToast('Método de pago creado exitosamente.');
      setShowModal(false);
      setNombre('');
      setDescripcion('');
      fetchMetodos();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al crear el método de pago.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleToggle = async (id: number, nombreMetodo: string, estadoActual: string) => {
    try {
      const response = await api.patch(`/MetodoPago/${id}/toggle`, {});
      const nuevoEstado = response.data.nuevoEstado;
      triggerToast(`"${nombreMetodo}" ahora está ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'}.`);
      fetchMetodos();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al cambiar el estado.');
    }
  };

  const activos = metodos.filter(m => m.estado === 'Activo');
  const inactivos = metodos.filter(m => m.estado !== 'Activo');

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-neutral-500" />
            Métodos de Pago
          </h2>
          <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">
            Administra los métodos de pago disponibles en el punto de venta.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 py-2 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Método
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Total</p>
          <p className="text-[28px] font-bold text-neutral-900 dark:text-white">{metodos.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Activos</p>
          <p className="text-[28px] font-bold text-green-500">{activos.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Inactivos</p>
          <p className="text-[28px] font-bold text-neutral-400">{inactivos.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850/50 border-b border-neutral-200/60 dark:border-neutral-800/60 text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Método</th>
                <th className="py-3.5 px-5">Descripción</th>
                <th className="py-3.5 px-5">Estado</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-neutral-400">
                    Cargando métodos de pago...
                  </td>
                </tr>
              ) : metodos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-neutral-400">
                    No hay métodos de pago registrados.
                  </td>
                </tr>
              ) : (
                metodos.map(m => (
                  <tr key={m.id} className={`hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors ${m.estado !== 'Activo' ? 'opacity-50' : ''}`}>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white">{m.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-neutral-500 dark:text-neutral-400">
                      {m.descipcion || <span className="text-neutral-300 dark:text-neutral-700 italic">Sin descripción</span>}
                    </td>
                    <td className="py-3.5 px-5">
                      {m.estado === 'Activo' ? (
                        <span className="px-2.5 py-0.5 rounded-full border border-green-300 dark:border-green-900 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleToggle(m.id, m.nombre, m.estado)}
                        title={m.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer text-neutral-600 dark:text-neutral-400"
                      >
                        {m.estado === 'Activo'
                          ? <><ToggleRight className="w-4 h-4 text-green-500" /> Desactivar</>
                          : <><ToggleLeft className="w-4 h-4 text-neutral-400" /> Activar</>
                        }
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info note */}
      <p className="text-[11px] text-neutral-400 dark:text-neutral-600 leading-relaxed">
        ⚠️ Solo los métodos de pago con estado <strong>Activo</strong> estarán disponibles para el Cajero al momento de registrar una venta.
      </p>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-sm w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-neutral-500" />
                Nuevo Método de Pago
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Nombre *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Transferencia Bancaria"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Depósito bancario o transferencia..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitLoading ? 'Creando...' : 'Crear Método'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
