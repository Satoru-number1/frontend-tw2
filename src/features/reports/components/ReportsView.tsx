import { useState, useEffect } from 'react';
import { FileText, AlertCircle, TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';
import api from '../../../services/api';
import { generarReporteVentasPdf } from '../../../utils/pdfGenerator';

interface ReportsViewProps {
  triggerToast: (msg: string) => void;
}

interface MasVendido {
  codigoBarras: string;
  nombre: string;
  cantidadVendida: number;
  totalRecaudado: number;
}

interface RotacionItem {
  codigoBarras: string;
  nombre: string;
  cantidadVendida: number;
  nivelRotacion: string;
}

export default function ReportsView({ triggerToast }: ReportsViewProps) {
  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensual'>('diario');
  const [isLoading, setIsLoading] = useState(true);
  
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalGanancias, setTotalGanancias] = useState(0);
  const [totalTransacciones, setTotalTransacciones] = useState(0);
  
  const [masVendidos, setMasVendidos] = useState<MasVendido[]>([]);
  const [altaRotacion, setAltaRotacion] = useState<RotacionItem[]>([]);
  const [bajaRotacion, setBajaRotacion] = useState<RotacionItem[]>([]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [gananciasRes, ventasRes, tendenciasRes] = await Promise.all([
        api.get(`/Reportes/ganancias?periodo=${period}`),
        api.get(`/Reportes/ventas?periodo=${period}`),
        api.get('/Reportes/tendencias')
      ]);

      const gData = gananciasRes.data || {};
      const vData = ventasRes.data || {};
      const tData = tendenciasRes.data || {};

      setTotalVentas(vData.totalRecaudado !== undefined ? vData.totalRecaudado : gData.totalVentas || 0);
      setTotalGanancias(gData.totalGanancias !== undefined ? gData.totalGanancias : 0);
      setTotalTransacciones(vData.totalTransacciones !== undefined ? vData.totalTransacciones : 0);
      setMasVendidos(vData.masVendidos || []);
      
      setAltaRotacion(tData.altaRotacion || []);
      setBajaRotacion(tData.bajaRotacion || []);
    } catch (err) {
      triggerToast('Error al sincronizar datos analíticos del servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleExportPdf = () => {
    if (totalTransacciones === 0 && masVendidos.length === 0) {
      triggerToast('No hay datos de ventas para generar el reporte.');
      return;
    }
    try {
      triggerToast('Generando reporte PDF de ventas...');
      generarReporteVentasPdf({
        periodo: period,
        totalTransacciones,
        totalRecaudado: totalVentas,
        masVendidos
      }, period);
      triggerToast('Reporte PDF descargado con éxito.');
    } catch (err) {
      triggerToast('Error al generar el reporte PDF.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div className="flex bg-neutral-200/60 dark:bg-neutral-800/60 p-1 rounded-xl">
          {(['diario', 'semanal', 'mensual'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold capitalize transition-all cursor-pointer ${
                period === p
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button 
          onClick={handleExportPdf}
          className="flex items-center gap-2 py-2 px-4 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg text-[13px] font-semibold transition-all cursor-pointer text-neutral-700 dark:text-neutral-300"
        >
          <FileText className="w-4 h-4" />
          <span>Exportar Reporte a PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-32">
          <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Ventas Totales
          </p>
          <h3 className="text-[26px] font-black text-neutral-900 dark:text-white my-1.5 leading-none">
            {isLoading ? '...' : `Bs ${totalVentas.toFixed(2)}`}
          </h3>
          <span className="text-[11px] text-neutral-450">Periodo consolidado</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-32">
          <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Utilidad Neta
          </p>
          <h3 className="text-[26px] font-black text-neutral-900 dark:text-white my-1.5 leading-none">
            {isLoading ? '...' : `Bs ${totalGanancias.toFixed(2)}`}
          </h3>
          <span className="text-[11px] text-neutral-450">Margen real de ganancias</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-32">
          <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Transacciones
          </p>
          <h3 className="text-[26px] font-black text-neutral-900 dark:text-white my-1.5 leading-none">
            {isLoading ? '...' : totalTransacciones}
          </h3>
          <span className="text-[11px] text-neutral-450">Ticket promedio: Bs {totalTransacciones > 0 ? (totalVentas / totalTransacciones).toFixed(2) : '0.00'}</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-32">
          <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Consolidado
          </p>
          <h3 className="text-[24px] font-black text-neutral-900 dark:text-white my-1.5 leading-none capitalize">
            {period}
          </h3>
          <span className="text-[11px] text-neutral-450">Filtro de visualización</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-neutral-955 dark:text-white mb-4">Volumen de Recaudación por Producto</h3>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="py-10 text-center text-neutral-400">Analizando registros...</div>
              ) : masVendidos.length === 0 ? (
                <div className="py-10 text-center text-neutral-400">Sin transacciones registradas para este periodo.</div>
              ) : (
                masVendidos.map((prod, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[13px] font-medium">
                      <span className="text-neutral-800 dark:text-neutral-200">{prod.nombre}</span>
                      <span className="font-bold">Bs {prod.totalRecaudado.toFixed(2)} ({prod.cantidadVendida} uds.)</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neutral-600 dark:bg-neutral-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (prod.totalRecaudado / (totalVentas || 1)) * 100)}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm select-none">
            <h3 className="text-[14px] font-bold text-neutral-955 dark:text-white mb-4">Tendencias de Rotación (Stock)</h3>
            
            <div className="mb-5">
              <p className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest mb-3">Alta Rotación</p>
              <div className="flex flex-col gap-3.5">
                {isLoading ? (
                  <p className="text-[12px] text-neutral-400">Procesando...</p>
                ) : altaRotacion.length === 0 ? (
                  <p className="text-[12px] text-neutral-400">Sin datos de rotación alta.</p>
                ) : (
                  altaRotacion.slice(0, 3).map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[13px] font-medium mb-1">
                        <span className="text-neutral-800 dark:text-neutral-200">{item.nombre}</span>
                        <span className="text-[11px] text-neutral-400">{item.cantidadVendida} uds.</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-850 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-600 dark:bg-neutral-450 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest mb-3">Baja Rotación</p>
              <div className="flex flex-col gap-3.5">
                {isLoading ? (
                  <p className="text-[12px] text-neutral-400">Procesando...</p>
                ) : bajaRotacion.length === 0 ? (
                  <p className="text-[12px] text-neutral-400">Sin datos de rotación baja.</p>
                ) : (
                  bajaRotacion.slice(0, 3).map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[13px] font-medium mb-1">
                        <span className="text-neutral-700 dark:text-neutral-350">{item.nombre}</span>
                        <span className="text-[11px] text-neutral-400">{item.cantidadVendida} uds.</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-850 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-300 dark:bg-neutral-700 rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 select-none">
              <AlertCircle className="w-4 h-4 text-neutral-500" />
              <h3 className="text-[14px] font-bold text-neutral-955 dark:text-white">Notificaciones del Negocio</h3>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-955/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-normal">
                  Control diario: Las conciliaciones bancarias automatizadas se ejecutan cada 1 minuto.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-955/20">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-450 mt-2 flex-shrink-0" />
                <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-normal">
                  Respaldo: Base de datos POS respaldada en la nube de forma segura (Backup automático de 24h).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
