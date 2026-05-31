import { useState, useEffect } from 'react';
import { Shield, Settings, Calendar, Award, Landmark, RefreshCw } from 'lucide-react';
import api from '../../../services/api';

interface CierreCajaViewProps {
  triggerToast: (msg: string) => void;
}

interface CierreRecord {
  id: number;
  emailUsuario: string;
  fechaCierre: string;
  totalVentas: number;
  cantidadTransacciones: number;
  efectivo: number;
  tarjeta: number;
  qr: number;
  observaciones: string;
}

export default function CierreCajaView({ triggerToast }: CierreCajaViewProps) {
  const [userRole, setUserRole] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<CierreRecord[]>([]);
  const [summary, setSummary] = useState<CierreRecord | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserRole(parsed.role || 'Cajero');
      if (parsed.role === 'Gerente') {
        fetchHistory();
      }
    }
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/CierreCaja/historial');
      setHistory(response.data || []);
    } catch (err) {
      triggerToast('Error al cargar historial de cierres de caja.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerarCierre = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/CierreCaja/generar', {
        observaciones: observaciones
      });
      setSummary(response.data);
      triggerToast('Cierre de caja generado con éxito.');
      setObservaciones('');
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al generar el cierre de caja para el día de hoy.');
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole === 'Gerente') {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div className="flex justify-between items-center select-none">
          <h2 className="text-[16px] font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
            <Shield className="w-5 h-5" />
            Historial de Cierres de Caja (Auditoría)
          </h2>
          <button
            onClick={fetchHistory}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-neutral-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-lg shadow-sm overflow-hidden select-none">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-850/50 border-b border-neutral-200/60 dark:border-neutral-800/60 text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Fecha</th>
                  <th className="py-3.5 px-5">Cajero</th>
                  <th className="py-3.5 px-5">Transacciones</th>
                  <th className="py-3.5 px-5">Desglose (Efectivo/Tarjeta/QR)</th>
                  <th className="py-3.5 px-5">Total</th>
                  <th className="py-3.5 px-5">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-neutral-400">
                      Cargando historial de cierres...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-neutral-400">
                      No hay registros de cierres de caja.
                    </td>
                  </tr>
                ) : (
                  history.map(record => (
                    <tr key={record.id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors text-neutral-800 dark:text-neutral-200">
                      <td className="py-3.5 px-5 font-medium whitespace-nowrap">
                        {new Date(record.fechaCierre).toLocaleDateString()} {new Date(record.fechaCierre).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-5 font-semibold">{record.emailUsuario}</td>
                      <td className="py-3.5 px-5 text-neutral-500">{record.cantidadTransacciones}</td>
                      <td className="py-3.5 px-5 text-neutral-500 font-mono text-[12px]">
                        Bs {record.efectivo.toFixed(2)} / Bs {record.tarjeta.toFixed(2)} / Bs {record.qr.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-neutral-900 dark:text-white">
                        Bs {record.totalVentas.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 text-neutral-450 dark:text-neutral-500 max-w-xs truncate" title={record.observaciones}>
                        {record.observaciones || 'Sin observaciones'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center py-6 select-none animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 text-neutral-900 dark:text-white">
          <span className="text-[14px] font-bold flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-550" />
            Cierre de Turno Diario
          </span>
          <span className="text-[12px] font-semibold text-neutral-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString()}
          </span>
        </div>

        {summary ? (
          <div className="flex flex-col gap-5 animate-fadeIn">
            <div className="p-4 bg-green-55/10 border border-green-200/30 rounded-xl flex items-center gap-3">
              <Award className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="text-[13px] font-bold text-neutral-900 dark:text-white">Cierre Procesado Exitosamente</h4>
                <p className="text-[11px] text-neutral-500">Se han guardado todos los datos contables y movimientos.</p>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[14px] font-bold text-neutral-950 dark:text-white">Ventas Consolidadas</h3>
              <span className="text-[22px] font-black text-neutral-955 dark:text-white">Bs {summary.totalVentas.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-500">Efectivo Recaudado</span>
                <span className="font-bold">Bs {summary.efectivo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-500">Tarjeta Recaudado</span>
                <span className="font-bold">Bs {summary.tarjeta.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-500">QR Recaudado</span>
                <span className="font-bold">Bs {summary.qr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-500">Transacciones Realizadas</span>
                <span className="font-bold">{summary.cantidadTransacciones}</span>
              </div>
            </div>

            <button
              onClick={() => setSummary(null)}
              className="w-full py-3 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-[13px] font-bold transition-all cursor-pointer mt-2"
            >
              Realizar Nuevo Cierre
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center gap-3">
              <Landmark className="w-5 h-5 text-neutral-600 dark:text-neutral-450" />
              <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-normal">
                Al procesar el cierre, el sistema consolidará todas las ventas procesadas por su cuenta durante el día de hoy, y guardará los totales separados por métodos de pago.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Observaciones / Novedades del día</label>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Indique si existe alguna novedad en caja, arqueos o diferencias..."
                className="w-full p-3 border border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 rounded-lg text-[13px] outline-none focus:border-neutral-550 resize-none text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <button
              onClick={handleGenerarCierre}
              disabled={isLoading}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 disabled:bg-neutral-300 text-white rounded-lg text-[13px] font-bold transition-all cursor-pointer shadow-md"
            >
              {isLoading ? 'Consolidando Caja...' : 'Generar y Registrar Cierre de Caja'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
