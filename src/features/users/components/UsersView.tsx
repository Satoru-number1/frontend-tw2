import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit3, X, UserPlus, Shield } from "lucide-react";
import api from "../../../services/api";
import Button from "../../../components/Button";

interface UsersViewProps {
  triggerToast: (msg: string) => void;
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  rawRole: number;
}

export default function UsersView({ triggerToast }: UsersViewProps) {
  const [userSearch, setUserSearch] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("Todos");
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const [newNombre, setNewNombre] = useState("");
  const [newApellido, setNewApellido] = useState("");
  const [newCi, setNewCi] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newDireccion, setNewDireccion] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Cajero");

  const [editRole, setEditRole] = useState("Cajero");

  const getRoleString = (rol: number | string) => {
    if (rol === 0 || rol === "Gerente") return "Gerente";
    if (rol === 1 || rol === "EncargadoAlmacen") return "Encargado de Almacén";
    if (rol === 2 || rol === "Cajero") return "Cajero";
    return "Cliente";
  };

  const getRoleEnum = (roleStr: string): number => {
    if (roleStr === "Gerente") return 0;
    if (roleStr === "Encargado de Almacén" || roleStr === "EncargadoAlmacen")
      return 1;
    if (roleStr === "Cajero") return 2;
    return 3;
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/Usuarios/Usuarios-con-roles");
      const data = response.data || [];
      const mapped = data.map((u: any, idx: number) => ({
        id: idx + 1,
        name: u.nombre || "Sin Nombre",
        email: u.email || "",
        role: getRoleString(u.rol !== undefined ? u.rol : u.Rol),
        rawRole: u.rol !== undefined ? u.rol : u.Rol,
        status:
          u.estado === 0 || u.Estado === 0 || u.estado === "Activo"
            ? "Activo"
            : "Inactivo",
      }));
      setUsersList(mapped);
    } catch (err) {
      triggerToast("Error al cargar la lista de usuarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre || !newApellido || !newCi || !newEmail || !newPassword) {
      triggerToast("Por favor, rellene todos los campos obligatorios.");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const requestData = {
        email: newEmail,
        password: newPassword,
        personaId: 0,
        nombre: newNombre,
        apellido: newApellido,
        ci: newCi,
        telefono: newTelefono,
        direccion: newDireccion,
        rol: newRole === "Encargado de Almacén" ? "EncargadoAlmacen" : newRole,
        persona: {
          nombre: newNombre,
          apellido: newApellido,
          ci: newCi,
          telefono: newTelefono,
          direccion: newDireccion,
        },
      };

      await api.post("/auth/register", requestData);
      triggerToast("Usuario registrado exitosamente.");
      setShowAddModal(false);

      setNewNombre("");
      setNewApellido("");
      setNewCi("");
      setNewTelefono("");
      setNewDireccion("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("Cajero");

      fetchUsers();
    } catch (err: any) {
      triggerToast(
        err.response?.data?.mensaje || "Error al registrar nuevo usuario.",
      );
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitLoading(true);
    try {
      const patchData = {
        email: selectedUser.email,
        rolActual: selectedUser.rawRole,
        rolNuevo: getRoleEnum(editRole),
      };

      await api.patch("/Usuarios/Actualizar-Rol-Email", patchData);
      triggerToast(`Rol de ${selectedUser.name} actualizado exitosamente.`);
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      triggerToast(
        err.response?.data?.mensaje || "Error al actualizar rol del usuario.",
      );
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteUser = async (user: UserRecord) => {
    if (!window.confirm(`¿Está seguro de eliminar al usuario ${user.name}?`)) {
      return;
    }

    try {
      const deleteData = {
        nombre: user.name,
        email: user.email,
      };

      await api.delete("/Usuarios/Eliminar-Usuario", { data: deleteData });
      triggerToast(`Usuario ${user.name} eliminado exitosamente.`);
      fetchUsers();
    } catch (err: any) {
      triggerToast(err.response?.data?.mensaje || "Error al eliminar usuario.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 select-none">
        <div className="flex-1 flex gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar usuario por nombre o email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/10 text-neutral-800 dark:text-neutral-200"
            />
          </div>

          <select
            value={userFilterRole}
            onChange={(e) => setUserFilterRole(e.target.value)}
            className="py-2 px-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
          >
            <option value="Todos">Rol: Todos</option>
            <option value="Gerente">Gerente</option>
            <option value="Cajero">Cajero</option>
            <option value="Encargado de Almacén">Encargado de Almacén</option>
            <option value="Cliente">Cliente</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 py-2 px-4 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-lg shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850/50 border-b border-neutral-200/60 dark:border-neutral-800/60 text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Nombre</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Rol</th>
                <th className="py-3.5 px-5">Estado</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                usersList
                  .filter((u) => {
                    const matchesSearch =
                      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearch.toLowerCase());
                    const matchesRole =
                      userFilterRole === "Todos" || u.role === userFilterRole;
                    return matchesSearch && matchesRole;
                  })
                  .map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-bold text-neutral-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="py-3.5 px-5 text-neutral-550 dark:text-neutral-400 font-mono">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditRole(user.role);
                            setShowEditModal(true);
                          }}
                          className="py-1 px-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Rol</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-xl w-full p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                <UserPlus className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                Registrar Nuevo Usuario
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleRegisterUser} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    placeholder="Escriba el nombre..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={newApellido}
                    onChange={(e) => setNewApellido(e.target.value)}
                    placeholder="Escriba el apellido..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    CI *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCi}
                    onChange={(e) => setNewCi(e.target.value)}
                    placeholder="1234567 LP"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={newTelefono}
                    onChange={(e) => setNewTelefono(e.target.value)}
                    placeholder="78901234"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                  Dirección
                </label>
                <input
                  type="text"
                  value={newDireccion}
                  onChange={(e) => setNewDireccion(e.target.value)}
                  placeholder="Av. Principal Nro 123"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="usuario@elahorro.bo"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none focus:border-neutral-500 text-neutral-800 dark:text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                  Asignar Rol
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                >
                  <option value="Cajero">Cajero</option>
                  <option value="Encargado de Almacén">
                    Encargado de Almacén
                  </option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-855 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  isLoading={isSubmitLoading}
                  className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer"
                >
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-[16px] font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                <Shield className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                Actualizar Rol de Usuario
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleEditRole} className="flex flex-col gap-4">
              <div>
                <p className="text-[13px] text-neutral-600 dark:text-neutral-450 leading-relaxed">
                  Modifique el rol para el usuario:{" "}
                  <strong className="text-neutral-900 dark:text-white">
                    {selectedUser.name}
                  </strong>{" "}
                  ({selectedUser.email}).
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                  Nuevo Rol
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-[13px] outline-none text-neutral-800 dark:text-neutral-200"
                >
                  <option value="Cajero">Cajero</option>
                  <option value="Encargado de Almacén">
                    Encargado de Almacén
                  </option>
                  <option value="Gerente">Gerente</option>
                  <option value="Cliente">Cliente</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2 px-4 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[13px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-855 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  isLoading={isSubmitLoading}
                  className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-lg text-[13px] font-semibold shadow-md transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
