import { useState, useEffect } from 'react';
import { AlertCircle, Search, Plus, FileText, Camera, X, ClipboardCheck, Pencil } from 'lucide-react';
import api from '../../../services/api';
import { generarInventarioPdf } from '../../../utils/pdfGenerator';

interface InventoryViewProps {
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

export default function InventoryView({ triggerToast }: InventoryViewProps) {
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('Todas');
  const [inventoryStatus, setInventoryStatus] = useState('Todos');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCodigoBarras, setEditCodigoBarras] = useState('');
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editFechaVencimiento, setEditFechaVencimiento] = useState('');
  const [editEstado, setEditEstado] = useState(0);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [codigoProveedor, setCodigoProveedor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [precioCompra, setPrecioCompra] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(5);

  const [stockCodigoBarras, setStockCodigoBarras] = useState('');
  const [stockCantidad, setStockCantidad] = useState(0);
  const [stockFechaEntrega, setStockFechaEntrega] = useState('');
  const [stockDescripcion, setStockDescripcion] = useState('');
  const [stockTotal, setStockTotal] = useState(0);
  const [stockUnidades, setStockUnidades] = useState('Bueno');

  const [snapshotObs, setSnapshotObs] = useState('');

  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryInline, setShowAddCategoryInline] = useState(false);
  const [isCategorySubmitLoading, setIsCategorySubmitLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/Category/listar-Categorias');
      setCategoriesList(response.data || []);
    } catch (err) {
      console.error("Error al cargar categorías", err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      triggerToast('El nombre de la categoría no puede estar vacío.');
      return;
    }
    setIsCategorySubmitLoading(true);
    try {
      await api.post('/Category/Crear-Categoria', { name: newCategoryName });
      triggerToast('Categoría creada exitosamente.');
      setNewCategoryName('');
      setShowAddCategoryInline(false);
      await fetchCategories();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al crear la categoría.');
    } finally {
      setIsCategorySubmitLoading(false);
    }
  };

  const [providersList, setProvidersList] = useState<any[]>([]);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/Proveedores');
      setProvidersList(response.data || []);
    } catch (err) {
      console.error("Error al cargar proveedores", err);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/Productos/Obtener-Productos');
      setProducts(response.data || []);
    } catch (err) {
      triggerToast('Error al cargar el inventario.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchProviders();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !categoria || !codigoProveedor || !codigoBarras || !fechaVencimiento) {
      triggerToast('Por favor rellenar todos los campos obligatorios.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = fechaVencimiento.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    if (selectedDate < today) {
      triggerToast('La fecha de vencimiento no puede ser una fecha pasada.');
      return;
    }

    setIsSubmitLoading(true);
    try {
      await api.post('/Productos/Crear-Producto', {
        nombre,
        categoria,
        codigoProvedor: codigoProveedor,
        descripcion,
        fechaVencimiento,
        codigoBarras,
        precioCompra,
        stockMinimo
      });
      triggerToast('Producto catalogado exitosamente.');
      setShowAddProductModal(false);
      
      setNombre('');
      setCategoria('');
      setCodigoProveedor('');
      setDescripcion('');
      setFechaVencimiento('');
      setCodigoBarras('');
      setPrecioCompra(0);
      setStockMinimo(5);
      
      fetchProducts();
    } catch (err: any) {
      console.error("Error al registrar producto (detalles completos):", err.response?.data || err);
      let serverMessage = err.response?.data?.mensaje;
      if (!serverMessage && err.response?.data?.errors) {
        serverMessage = Object.values(err.response.data.errors).flat().join(', ');
      }
      if (!serverMessage) {
        serverMessage = (typeof err.response?.data === 'string' ? err.response.data : null)
          || err.response?.data?.title
          || 'Error al catalogar producto.';
      }
      triggerToast(serverMessage);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleCreateStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockCodigoBarras || stockCantidad <= 0 || !stockFechaEntrega) {
      triggerToast('Por favor complete todos los datos del abastecimiento.');
      return;
    }

    setIsSubmitLoading(true);
    try {
      await api.post('/MovimientoStock/Crear-Movimiento', {
        codigoBarras: stockCodigoBarras,
        cantidad: stockCantidad,
        fechaEntrega: stockFechaEntrega,
        descripcion: stockDescripcion,
        total: stockTotal,
        unidades: stockUnidades,
        tipoMovimiento: 'Entrada'
      });
      triggerToast('Lote de abastecimiento registrado con éxito.');
      setShowAddStockModal(false);
      
      setStockCodigoBarras('');
      setStockCantidad(0);
      setStockFechaEntrega('');
      setStockDescripcion('');
      setStockTotal(0);
      setStockUnidades('Bueno');
      
      fetchProducts();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al registrar el lote de abastecimiento.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    try {
      await api.post('/ReporteInventario/subir', {
        observaciones: snapshotObs
      });
      triggerToast('Snapshot de stock capturado y enviado al Gerente con éxito.');
      setShowSnapshotModal(false);
      setSnapshotObs('');
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al subir snapshot de stock.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const openEditModal = (item: Product) => {
    setEditCodigoBarras(item.codigoBarras);
    setEditNombre(item.nombre);
    setEditDescripcion('');
    // Format date to YYYY-MM-DD for input[type=date]
    const d = new Date(item.fechaVencimiento);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    setEditFechaVencimiento(`${yyyy}-${mm}-${dd}`);
    setEditEstado(0); // Bueno by default
    setShowEditModal(true);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNombre || !editFechaVencimiento) {
      triggerToast('El nombre y la fecha de vencimiento son obligatorios.');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = editFechaVencimiento.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    if (selectedDate < today) {
      triggerToast('La fecha de vencimiento no puede ser una fecha pasada.');
      return;
    }
    setIsSubmitLoading(true);
    try {
      await api.put(`/Productos/Actualizar-Producto/${editCodigoBarras}`, {
        nombre: editNombre,
        descripcion: editDescripcion,
        fechaVencimiento: editFechaVencimiento,
        estadoProducto: editEstado
      });
      triggerToast('Producto actualizado exitosamente.');
      setShowEditModal(false);
      fetchProducts();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al actualizar el producto.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDownloadStockPdf = () => {
    if (products.length === 0) {
      triggerToast('No hay productos para generar el reporte.');
      return;
    }
    try {
      triggerToast('Generando reporte PDF de inventario...');
      generarInventarioPdf(products);
      triggerToast('Reporte PDF del inventario descargado.');
    } catch (err) {
      triggerToast('Error al generar el PDF de stock.');
    }
  };

  const lowStockProducts = products.filter(p => p.stock <= p.stockMinimo);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {lowStockProducts.length > 0 && (
        <div className="p-4 border border-dashed border-red-300 dark:border-red-900 bg-red-50/10 dark:bg-red-950/10 rounded-xl flex items-start gap-3 select-none">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[13px] text-red-600 dark:text-red-400 font-semibold leading-relaxed">
              Alerta de stock crítico: Hay {lowStockProducts.length} productos por debajo del stock mínimo ({lowStockProducts.slice(0, 3).map(p => p.nombre).join(', ')}).
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 select-none">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-505 text-neutral-805 dark:text-neutral-200"
            />
          </div>

          <select
            value={inventoryCategory}
            onChange={(e) => setInventoryCategory(e.target.value)}
            className="py-2 px-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
          >
            <option value="Todas">Categoría: Todas</option>
            <option value="Abarrotes">Abarrotes</option>
            <option value="Lácteos">Lácteos</option>
            <option value="Panadería">Panadería</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Limpieza">Limpieza</option>
          </select>

          <select
            value={inventoryStatus}
            onChange={(e) => setInventoryStatus(e.target.value)}
            className="py-2 px-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
          >
            <option value="Todos">Filtro Stock: Todos</option>
            <option value="Bajo">Stock Bajo</option>
            <option value="Disponible">Disponible</option>
            <option value="Agotado">Agotado</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSnapshotModal(true)}
            className="flex items-center gap-1.5 py-2 px-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Corte Stock (Snapshot)</span>
          </button>

          <button
            onClick={() => setShowAddStockModal(true)}
            className="flex items-center gap-1.5 py-2 px-3 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Abastecer Stock</span>
          </button>

          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center gap-1.5 py-2 px-3 border border-neutral-350 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catalogar Producto</span>
          </button>

          <button 
            onClick={handleDownloadStockPdf}
            className="flex items-center gap-1.5 py-2 px-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg text-[13px] font-semibold transition-all cursor-pointer text-neutral-600 dark:text-neutral-400"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-lg shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850/50 border-b border-neutral-200/60 dark:border-neutral-800/60 text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Código de barras</th>
                <th className="py-3.5 px-5">Nombre</th>
                <th className="py-3.5 px-5">Categoría</th>
                <th className="py-3.5 px-5">Stock Actual</th>
                <th className="py-3.5 px-5">Stock Mínimo</th>
                <th className="py-3.5 px-5">Disponibilidad</th>
                <th className="py-3.5 px-5">Vencimiento</th>
                <th className="py-3.5 px-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-400">
                    Cargando inventario...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-400">
                    No hay productos catalogados.
                  </td>
                </tr>
              ) : (
                products
                  .filter(item => {
                    const matchesSearch = item.nombre.toLowerCase().includes(inventorySearch.toLowerCase()) || (item.codigoBarras && item.codigoBarras.includes(inventorySearch));
                    const matchesCategory = inventoryCategory === 'Todas' || item.categoria === inventoryCategory;
                    
                    let matchesStatus = true;
                    if (inventoryStatus === 'Bajo') {
                      matchesStatus = item.stock <= item.stockMinimo;
                    } else if (inventoryStatus === 'Disponible') {
                      matchesStatus = item.stock > 0;
                    } else if (inventoryStatus === 'Agotado') {
                      matchesStatus = item.stock === 0;
                    }

                    return matchesSearch && matchesCategory && matchesStatus;
                  })
                  .map(item => (
                    <tr key={item.codigoBarras} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors text-neutral-850 dark:text-neutral-250">
                      <td className="py-3.5 px-5 font-mono text-[12px] text-neutral-500">{item.codigoBarras || 'S/C'}</td>
                      <td className="py-3.5 px-5 font-bold text-neutral-900 dark:text-white">{item.nombre}</td>
                      <td className="py-3.5 px-5 text-neutral-500">{item.categoria}</td>
                      <td className={`py-3.5 px-5 font-extrabold ${item.stock <= item.stockMinimo ? 'text-red-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
                        {item.stock}
                      </td>
                      <td className="py-3.5 px-5 text-neutral-400">{item.stockMinimo}</td>
                      <td className="py-3.5 px-5">
                        {item.stock <= item.stockMinimo && item.stock > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full border border-dashed border-amber-400 text-amber-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            Stock bajo
                          </span>
                        ) : item.stock === 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                            Agotado
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                            {item.disponibilidad || 'Disponible'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-neutral-500 font-mono">
                        {new Date(item.fechaVencimiento).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Editar producto"
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white">Catalogar Nuevo Producto</h3>
              <button onClick={() => setShowAddProductModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Cód. Barras *</label>
                  <input type="text" required value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} placeholder="7501234500011" className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Proveedor *</label>
                  {providersList.length > 0 ? (
                    <select
                      value={codigoProveedor}
                      onChange={(e) => setCodigoProveedor(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                    >
                      <option value="">Seleccione...</option>
                      {providersList.map((prov: any) => (
                        <option key={prov.id || prov.codigoProveedor} value={prov.codigoProveedor}>
                          {prov.nombre} ({prov.codigoProveedor})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        type="text"
                        required
                        value={codigoProveedor}
                        onChange={(e) => setCodigoProveedor(e.target.value)}
                        placeholder="Ej. PROV-PIL"
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200 border-amber-300 dark:border-amber-900"
                      />
                      <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-1 leading-snug">
                        ⚠️ No hay proveedores. Regístralo en la pestaña "Proveedores" primero.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Nombre *</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Leche Entera PIL 1L" className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase block">Categoría *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryInline(!showAddCategoryInline)}
                      className="text-[10px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-bold flex items-center gap-0.5 cursor-pointer select-none"
                    >
                      + Nueva
                    </button>
                  </div>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required className={`w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200 ${categoriesList.length === 0 ? 'border-amber-300 dark:border-amber-900' : 'border-neutral-300 dark:border-neutral-800'}`}>
                    <option value="">Seleccione...</option>
                    {categoriesList.length > 0 ? (
                      categoriesList.map((cat: any) => (
                        <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Abarrotes">Abarrotes</option>
                        <option value="Lácteos">Lácteos</option>
                        <option value="Panadería">Panadería</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Limpieza">Limpieza</option>
                      </>
                    )}
                  </select>
                  {categoriesList.length === 0 && (
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-1 leading-snug">
                      ⚠️ No hay categorías guardadas. Créala con el botón "+ Nueva" de arriba primero.
                    </p>
                  )}
                  {showAddCategoryInline && (
                    <div className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Categoría..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-[12px] outline-none text-neutral-800 dark:text-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={isCategorySubmitLoading}
                        className="px-2.5 py-1 bg-neutral-800 dark:bg-white text-white dark:text-neutral-950 rounded text-[10px] font-bold hover:bg-neutral-700 dark:hover:bg-neutral-100 cursor-pointer disabled:opacity-50"
                      >
                        {isCategorySubmitLoading ? '...' : 'Crear'}
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Vencimiento *</label>
                  <input type="date" required value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Costo de Compra *</label>
                  <input type="number" step="0.01" required value={precioCompra} onChange={(e) => { const v = parseFloat(e.target.value); setPrecioCompra(isNaN(v) ? 0 : v); }} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Stock Mínimo</label>
                  <input type="number" required value={stockMinimo} onChange={(e) => { const v = parseInt(e.target.value); setStockMinimo(isNaN(v) ? 0 : v); }} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Descripción corta</label>
                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Lácteo pasteurizado enriquecido..." className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitLoading} className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer">
                  {isSubmitLoading ? 'Procesando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <ClipboardCheck className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                Registrar Abastecimiento (Entrada)
              </h3>
              <button onClick={() => setShowAddStockModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateStockMovement} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">Producto (Cód. de Barras) *</label>
                <select value={stockCodigoBarras} onChange={(e) => setStockCodigoBarras(e.target.value)} required className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200">
                  <option value="">Seleccione un producto...</option>
                  {products.map(p => (
                    <option key={p.codigoBarras} value={p.codigoBarras}>
                      {p.nombre} ({p.codigoBarras})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Cantidad *</label>
                  <input type="number" min="1" required value={stockCantidad} onChange={(e) => { const v = parseInt(e.target.value); setStockCantidad(isNaN(v) ? 0 : v); }} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Fecha Recepción *</label>
                  <input type="date" required value={stockFechaEntrega} onChange={(e) => setStockFechaEntrega(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Precio Lote Compra (Bs) *</label>
                  <input type="number" step="0.01" required value={stockTotal} onChange={(e) => { const v = parseFloat(e.target.value); setStockTotal(isNaN(v) ? 0 : v); }} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-555 uppercase mb-1 block">Estado Lote *</label>
                  <select value={stockUnidades} onChange={(e) => setStockUnidades(e.target.value)} required className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200">
                    <option value="Bueno">Bueno</option>
                    <option value="Dañado">Dañado</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">Descripción del Movimiento</label>
                <input type="text" value={stockDescripcion} onChange={(e) => setStockDescripcion(e.target.value)} placeholder="Ej. Lote de reposición de fin de mes..." className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200" />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button type="button" onClick={() => setShowAddStockModal(false)} className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitLoading} className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer">
                  {isSubmitLoading ? 'Procesando...' : 'Ingresar Lote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSnapshotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-5 h-5 text-neutral-600 dark:text-neutral-350" />
                Capturar Corte de Stock (Snapshot)
              </h3>
              <button onClick={() => setShowSnapshotModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="flex flex-col gap-4">
              <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-normal">
                Esta acción creará un registro de inventario con todos los productos de la tienda y sus stocks actuales congelados. Se enviará un informe consolidado vía email al Gerente.
              </p>

              <div>
                <label className="text-[11px] font-bold text-neutral-550 uppercase mb-1 block">Observaciones del corte de stock</label>
                <textarea rows={3} value={snapshotObs} onChange={(e) => setSnapshotObs(e.target.value)} placeholder="Ej. Corte mensual de auditoría interna de almacén..." className="w-full p-3 border border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 rounded-lg text-[13px] outline-none focus:border-neutral-500 resize-none text-neutral-800 dark:text-neutral-200" />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button type="button" onClick={() => setShowSnapshotModal(false)} className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitLoading} className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer">
                  {isSubmitLoading ? 'Procesando...' : 'Capturar Corte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Pencil className="w-4 h-4 text-neutral-500" />
                  Editar Producto
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">{editCodigoBarras}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Nombre *</label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  placeholder="Nombre del producto"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={editFechaVencimiento}
                    onChange={(e) => setEditFechaVencimiento(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Estado</label>
                  <select
                    value={editEstado}
                    onChange={(e) => setEditEstado(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                  >
                    <option value={0}>Bueno</option>
                    <option value={1}>Por vencer</option>
                    <option value={2}>Vencido</option>
                    <option value={3}>Caducado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1 block">Descripción</label>
                <input
                  type="text"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  placeholder="Descripción corta del producto..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button type="button" onClick={() => setShowEditModal(false)} className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitLoading} className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50">
                  {isSubmitLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
