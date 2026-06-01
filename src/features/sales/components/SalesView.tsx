import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Trash2,
  ShoppingBag,
  CreditCard,
  QrCode,
  DollarSign,
  CheckCircle2,
  Download,
} from "lucide-react";
import api from "../../../services/api";
import { generarComprobantePdf } from "../../../utils/pdfGenerator";

interface SalesViewProps {
  triggerToast: (msg: string) => void;
}

interface Product {
  nombre: string;
  categoria: string;
  fechaVencimiento: string;
  precio: number;
  stock: number;
  disponibilidad: string;
  stockMinimo: number;
  codigoBarras: string;
}

interface CartItem {
  codigoBarras: string;
  name: string;
  qty: number;
  price: number;
  maxStock: number;
}

interface ViewVentaResponse {
  venta: {
    total: number;
    fechaCompra: string;
    ventaId: number;
  };
  metodoPago: {
    nombre: string;
  };
  detalle: Array<{
    nombreProducto: string;
    precio: number;
    cantidad: number;
  }>;
  vuelto: number;
}

export default function SalesView({ triggerToast }: SalesViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [ticketItems, setTicketItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<
    "Efectivo" | "Tarjeta" | "QR"
  >("Efectivo");
  const [montoRecibido, setMontoRecibido] = useState<string>("0");
  const [saleResult, setSaleResult] = useState<ViewVentaResponse | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/Productos/Obtener-Productos");
      setProducts(response.data || []);
    } catch (err) {
      triggerToast("Error al cargar catálogo de productos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProductToTicket = (prod: Product) => {
    if (prod.stock <= 0) {
      triggerToast("El producto seleccionado no tiene stock disponible.");
      return;
    }

    const existing = ticketItems.find(
      (item) => item.codigoBarras === prod.codigoBarras,
    );
    if (existing) {
      if (existing.qty >= prod.stock) {
        triggerToast(
          `No puede vender más de ${prod.stock} unidades de este producto.`,
        );
        return;
      }
      setTicketItems(
        ticketItems.map((item) =>
          item.codigoBarras === prod.codigoBarras
            ? { ...item, qty: item.qty + 1 }
            : item,
        ),
      );
    } else {
      setTicketItems([
        ...ticketItems,
        {
          codigoBarras: prod.codigoBarras,
          name: prod.nombre,
          qty: 1,
          price: prod.precio,
          maxStock: prod.stock,
        },
      ]);
    }
  };

  const removeItemFromTicket = (codigoBarras: string) => {
    setTicketItems(
      ticketItems.filter((item) => item.codigoBarras !== codigoBarras),
    );
  };

  const updateItemQty = (codigoBarras: string, delta: number) => {
    setTicketItems(
      ticketItems.map((item) => {
        if (item.codigoBarras === codigoBarras) {
          const nextQty = item.qty + delta;
          if (nextQty > item.maxStock) {
            triggerToast(
              `Stock insuficiente. Solo quedan ${item.maxStock} unidades.`,
            );
            return item;
          }
          return nextQty > 0 ? { ...item, qty: nextQty } : item;
        }
        return item;
      }),
    );
  };

  const subtotalTicket = ticketItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const discountTicket = 0.0;
  const totalTicket = subtotalTicket - discountTicket;

  const parsedMonto = parseFloat(montoRecibido.replace(",", ".")) || 0;
  const changeTicket = Math.max(0, parsedMonto - totalTicket);

  const handleCheckout = async () => {
    if (ticketItems.length === 0) return;

    if (paymentMethod === "Efectivo" && parsedMonto < totalTicket) {
      triggerToast(
        "El monto en efectivo recibido es inferior al total a pagar.",
      );
      return;
    }

    setIsSubmitLoading(true);
    try {
      const payload = {
        Venta: {
          Total: totalTicket,
          Estado: 0,
          Descripcion: "Venta rápida de mostrador - POS",
        },
        MetodoPago: {
          Nombre: paymentMethod,
          Monto: paymentMethod === "Efectivo" ? parsedMonto : totalTicket,
          FechaPago: new Date().toISOString(),
        },
        Detalle: ticketItems.map((item) => ({
          NombreProducto: item.name,
          Precio: item.price,
          Cantidad: item.qty,
        })),
      };

      const response = await api.post("/Ventas/Crear-Venta", payload);
      const resData = response.data;
      const ventaData = resData.venta || resData.Venta;
      setSaleResult(ventaData);
      triggerToast("¡Venta completada con éxito!");

      // Auto-generate receipt PDF
      if (ventaData) {
        try {
          generarComprobantePdf({
            ventaId: ventaData.ventaId || ventaData.VentaId || 0,
            total: ventaData.total || ventaData.Total || totalTicket,
            fechaCompra:
              ventaData.fechaCompra ||
              ventaData.FechaCompra ||
              new Date().toISOString(),
            metodoPago: paymentMethod,
            vuelto: changeTicket,
            detalle: ticketItems.map((item) => ({
              nombreProducto: item.name,
              precio: item.price,
              cantidad: item.qty,
            })),
          });
          triggerToast("Comprobante PDF descargado automáticamente.");
        } catch (pdfErr) {
          console.error("Error al generar comprobante PDF", pdfErr);
        }
      }

      setTicketItems([]);
      setMontoRecibido("0");
      fetchProducts();
    } catch (err: any) {
      triggerToast(
        err.response?.data?.mensaje ||
          "Error al procesar la venta en el servidor.",
      );
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    triggerToast(
      "Esta funcionalidad ahora genera el comprobante automáticamente al completar la venta.",
    );
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.codigoBarras && p.codigoBarras.includes(searchQuery)),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="relative w-full select-none">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o código de barras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-900 text-[14px] rounded-lg border border-neutral-300 dark:border-neutral-800 focus:border-neutral-550 outline-none text-neutral-800 dark:text-neutral-200 shadow-sm"
          />
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 select-none">
            <h3 className="text-[14px] font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-neutral-550" />
              Catálogo de Venta
            </h3>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
              Pulse para agregar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="col-span-3 py-10 text-center text-neutral-400">
                Sincronizando inventario...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-3 py-10 text-center text-neutral-400">
                No se encontraron productos disponibles en el catálogo.
              </div>
            ) : (
              filteredProducts.map((prod) => (
                <button
                  key={prod.codigoBarras}
                  onClick={() => addProductToTicket(prod)}
                  disabled={prod.stock === 0}
                  className="flex flex-col border border-neutral-200/65 dark:border-neutral-800/65 hover:border-neutral-450 dark:hover:border-neutral-600 rounded-xl overflow-hidden bg-neutral-50/20 dark:bg-neutral-900 text-left p-3 hover:shadow-md transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-20 rounded-lg bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center overflow-hidden mb-2 border border-neutral-200/50 dark:border-neutral-850/50 relative">
                    <span className="font-mono text-[9px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest relative z-10">
                      {prod.categoria}
                    </span>
                  </div>

                  <p className="text-[12px] font-bold text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors truncate w-full">
                    {prod.nombre}
                  </p>
                  <p className="text-[14px] font-black text-neutral-805 dark:text-neutral-200 mt-0.5">
                    Bs {prod.precio.toFixed(2)}
                  </p>
                  <div className="flex justify-between items-center w-full mt-1.5">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Stock: {prod.stock}
                    </span>
                    {prod.stock <= prod.stockMinimo && prod.stock > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-500 border border-amber-550/10 uppercase">
                        Crítico
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {saleResult && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="text-[13px] font-bold text-neutral-900 dark:text-white">
                  ¡Venta Exitosa!
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Transacción #{saleResult.venta?.ventaId || "0000"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Venta</span>
                <span className="font-bold">
                  Bs {(saleResult.venta?.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Método de Pago</span>
                <span className="font-bold">
                  {saleResult.metodoPago?.nombre || "Efectivo"}
                </span>
              </div>
              {saleResult.vuelto > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Cambio Entregado</span>
                  <span>Bs {saleResult.vuelto.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleDownloadInvoice()}
                className="flex-1 py-2.5 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Download className="w-4 h-4" />
                Imprimir Recibo
              </button>
              <button
                onClick={() => setSaleResult(null)}
                className="py-2.5 px-4 border border-neutral-350 dark:border-neutral-700 hover:bg-neutral-50 text-neutral-600 dark:text-neutral-400 rounded-lg text-[12px] font-bold transition-all cursor-pointer"
              >
                Nuevo Ticket
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center select-none border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span className="text-[14px] font-bold">Resumen de Ticket</span>
            </div>
            <span className="text-[11px] font-bold text-neutral-400 tracking-wider">
              POS ACTIVO
            </span>
          </div>

          <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
            {ticketItems.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 dark:text-neutral-500 select-none">
                Agregue productos para iniciar
              </div>
            ) : (
              ticketItems.map((item) => (
                <div
                  key={item.codigoBarras}
                  className="flex justify-between items-start gap-2 border-b border-neutral-50 dark:border-neutral-950 pb-2"
                >
                  <div className="overflow-hidden flex-1">
                    <p className="text-[12px] font-bold text-neutral-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 select-none">
                      <button
                        onClick={() => updateItemQty(item.codigoBarras, -1)}
                        className="w-5 h-5 flex items-center justify-center border border-neutral-250 dark:border-neutral-700 text-neutral-550 rounded font-bold hover:bg-neutral-50 dark:hover:bg-neutral-850 text-[12px] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-[11px] font-bold w-6 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateItemQty(item.codigoBarras, 1)}
                        className="w-5 h-5 flex items-center justify-center border border-neutral-250 dark:border-neutral-700 text-neutral-550 rounded font-bold hover:bg-neutral-50 dark:hover:bg-neutral-855 text-[12px] cursor-pointer"
                      >
                        +
                      </button>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 pl-1">
                        x Bs {item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[12px] font-extrabold text-neutral-805 dark:text-neutral-200">
                      Bs {(item.price * item.qty).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItemFromTicket(item.codigoBarras)}
                      className="text-red-500 hover:text-red-750 p-0.5 mt-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex flex-col gap-2 text-[13px] font-medium text-neutral-500 dark:text-neutral-400 select-none">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-neutral-800 dark:text-neutral-200">
                Bs {subtotalTicket.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Descuento</span>
              <span className="text-neutral-800 dark:text-neutral-200">
                Bs {discountTicket.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[16px] font-extrabold text-neutral-900 dark:text-white border-t border-neutral-100 dark:border-neutral-800 pt-3">
              <span>TOTAL</span>
              <span>Bs {totalTicket.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 select-none">
            <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              Método de pago
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("Efectivo")}
                className={`py-2 px-1 border rounded-xl text-[12px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === "Efectivo"
                    ? "border-neutral-500 bg-neutral-100 dark:bg-neutral-850 dark:text-white shadow-sm"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Efectivo</span>
              </button>
              <button
                onClick={() => setPaymentMethod("Tarjeta")}
                className={`py-2 px-1 border rounded-xl text-[12px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === "Tarjeta"
                    ? "border-neutral-500 bg-neutral-100 dark:bg-neutral-850 dark:text-white shadow-sm"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta</span>
              </button>
              <button
                onClick={() => setPaymentMethod("QR")}
                className={`py-2 px-1 border rounded-xl text-[12px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === "QR"
                    ? "border-neutral-500 bg-neutral-100 dark:bg-neutral-850 dark:text-white shadow-sm"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR</span>
              </button>
            </div>
          </div>

          {paymentMethod === "Efectivo" && (
            <div className="grid grid-cols-2 gap-4 select-none">
              <div>
                <label className="text-[11px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest block mb-1">
                  Monto recibido
                </label>
                <input
                  type="text"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  className="w-full py-2 px-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-550"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest block mb-1">
                  Cambio (vuelto)
                </span>
                <div className="w-full py-2 px-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-lg text-[13px] font-bold text-neutral-700 dark:text-neutral-300">
                  Bs {changeTicket.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={ticketItems.length === 0 || isSubmitLoading}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 disabled:bg-neutral-300 text-white rounded-xl text-[13px] font-bold transition-all cursor-pointer select-none shadow-md disabled:pointer-events-none"
          >
            {isSubmitLoading
              ? "Procesando Venta..."
              : "Confirmar Venta y Cobrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
