import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, FolderOpen, X } from 'lucide-react';
import api from '../../../services/api';

interface CategoriesViewProps {
  triggerToast: (msg: string) => void;
}

interface CategoryRecord {
  id: number;
  name: string;
}

export default function CategoriesView({ triggerToast }: CategoriesViewProps) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRecord | null>(null);

  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/Category/listar-Categorias');
      setCategories(response.data || []);
    } catch (err) {
      triggerToast('Error al cargar la lista de categorías.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      triggerToast('El nombre de la categoría no puede estar vacío.');
      return;
    }

    setIsSubmitLoading(true);
    try {
      await api.post('/Category/Crear-Categoria', { name: newCategoryName });
      triggerToast('Categoría creada exitosamente.');
      setShowAddModal(false);
      setNewCategoryName('');
      fetchCategories();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al crear la categoría.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !editCategoryName.trim()) return;

    setIsSubmitLoading(true);
    try {
      await api.put(`/Category/${selectedCategory.name}`, { name: editCategoryName });
      triggerToast('Categoría actualizada exitosamente.');
      setShowEditModal(false);
      setSelectedCategory(null);
      setEditCategoryName('');
      fetchCategories();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al actualizar la categoría.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryRecord) => {
    if (!window.confirm(`¿Está seguro de eliminar la categoría "${cat.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/Category/${cat.name}`);
      triggerToast(`Categoría "${cat.name}" eliminada exitosamente.`);
      fetchCategories();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || 'Error al eliminar la categoría.');
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 select-none">
        <div className="flex-1 flex gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar categoría por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl text-[13px] outline-none text-neutral-800 dark:text-neutral-200 focus:border-neutral-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl text-[13px] font-semibold transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850/50 border-b border-neutral-200/60 dark:border-neutral-800/60 text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5 w-20">ID</th>
                <th className="py-3.5 px-5">Nombre de la Categoría</th>
                <th className="py-3.5 px-5 text-right w-44">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[13px] text-neutral-450">
                    Cargando categorías...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[13px] text-neutral-450">
                    {searchQuery ? 'No se encontraron categorías.' : 'No hay categorías registradas.'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr
                    key={cat.id || cat.name}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors text-[13px] text-neutral-800 dark:text-neutral-200"
                  >
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">
                      {cat.id || '#'}
                    </td>
                    <td className="py-3.5 px-5 font-medium">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-5 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setEditCategoryName(cat.name);
                          setShowEditModal(true);
                        }}
                        className="py-1 px-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="py-1 px-3 border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                <FolderOpen className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                Registrar Nueva Categoría
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej. Abarrotes, Limpieza, Panadería..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="py-2 px-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                <Edit3 className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                Actualizar Nombre de Categoría
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleEditCategory} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">Nuevo Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="py-2 px-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
