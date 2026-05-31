import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, TrendingUp, Package, Users, Settings, ShoppingBag, CheckCircle2, FolderOpen, CreditCard } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ReportsView from '../features/reports/components/ReportsView';
import SalesView from '../features/sales/components/SalesView';
import InventoryView from '../features/inventory/components/InventoryView';
import ProvidersView from '../features/providers/components/ProvidersView';
import CierreCajaView from '../features/cierre/components/CierreCajaView';
import UsersView from '../features/users/components/UsersView';
import CategoriesView from '../features/categories/components/CategoriesView';
import PaymentMethodsView from '../features/payments/components/PaymentMethodsView';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'ventas' | 'inventario' | 'proveedores' | 'reportes' | 'cierre' | 'usuarios' | 'categorias' | 'pagos'>('reportes');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    } else {
      const parsed = JSON.parse(savedUser);
      setCurrentUser(parsed);
      const role = parsed.role;
      if (role === 'Cajero') {
        setActiveTab('ventas');
      } else if (role === 'EncargadoAlmacen' || role === 'Encargado de Almacén') {
        setActiveTab('inventario');
      } else {
        setActiveTab('reportes');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const triggerToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const isTabAllowed = (tab: string) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === 'Cajero') {
      return tab === 'ventas' || tab === 'cierre';
    }
    if (role === 'EncargadoAlmacen' || role === 'Encargado de Almacén') {
      return tab === 'inventario' || tab === 'proveedores';
    }
    if (role === 'Gerente') {
      return tab === 'reportes' || tab === 'inventario' || tab === 'proveedores' || tab === 'usuarios' || tab === 'categorias' || tab === 'pagos';
    }
    return false;
  };

  if (!currentUser) return null;

  const headerContext = {
    ventas: {
      title: 'Registrar Venta',
      badge: 'ROL: CAJERO',
      profile: { name: currentUser.name || currentUser.email, role: 'Cajero', initials: (currentUser.name || currentUser.email).substring(0, 2).toUpperCase() }
    },
    inventario: {
      title: 'Inventario',
      badge: 'ROL: ENCARGADO DE ALMACÉN',
      profile: { name: currentUser.name || currentUser.email, role: 'Encargado de Almacén', initials: (currentUser.name || currentUser.email).substring(0, 2).toUpperCase() }
    },
    proveedores: {
      title: 'Proveedores',
      badge: 'ROL: ENCARGADO DE ALMACÉN',
      profile: { name: currentUser.name || currentUser.email, role: 'Encargado de Almacén', initials: (currentUser.name || currentUser.email).substring(0, 2).toUpperCase() }
    },
    reportes: {
      title: 'Reportes y Dashboard',
      badge: 'ROL: GERENTE',
      profile: { name: currentUser.name || currentUser.email, role: 'Gerente', initials: (currentUser.name || currentUser.email).substring(0, 2).toUpperCase() }
    },
    cierre: {
      title: 'Cierre de Caja',
      badge: 'ROL: CAJERO',
      profile: { name: currentUser.name || currentUser.email, role: 'Cajero', initials: (currentUser.name || currentUser.email).substring(0, 2).toUpperCase() }
    },
    usuarios: {
      title: 'Gestión de Usuarios',
      badge: 'ROL: GERENTE',
      profile: { name: currentUser.name || currentUser.email, role: 'Gerente', initials: (currentUser.name || currentUser.email).substring(0, 2).toUpperCase() }
    },
    categorias: {
      title: 'Gestión de Categorías',
      badge: 'ROL: GERENTE',
      profile: { name: currentUser.name || currentUser.email, role: 'Gerente', initials: (currentUser.name || currentUser.email).substring(0, 2).toUpperCase() }
    },
    pagos: {
      title: 'Métodos de Pago',
      badge: 'ROL: GERENTE',
      profile: { name: currentUser.name || currentUser.email, role: 'Gerente', initials: (currentUser.name || currentUser.email).substring(0, 2).toUpperCase() }
    }
  };

  const activeHeader = headerContext[activeTab] || headerContext['reportes'];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors duration-300 flex">
      {successMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2.5 px-4 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-955 rounded-xl shadow-lg border border-neutral-850 dark:border-neutral-200 animate-slideIn z-50 select-none">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-[13px] font-semibold">{successMessage}</span>
        </div>
      )}

      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200/80 dark:border-neutral-800/80 p-6 flex flex-col justify-between hidden md:flex select-none">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 bg-neutral-50 dark:bg-neutral-800 shadow-sm">
              <Home className="w-full h-full text-neutral-600 dark:text-neutral-300 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-neutral-900 dark:text-white leading-none">El Ahorro</h2>
              <span className="text-[9px] text-neutral-450 font-semibold tracking-wider uppercase">Punto de Venta</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {isTabAllowed('ventas') && (
              <button
                onClick={() => setActiveTab('ventas')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'ventas'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-955 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-955 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ventas</span>
              </button>
            )}

            {isTabAllowed('inventario') && (
              <button
                onClick={() => setActiveTab('inventario')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'inventario'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-955 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-955 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Inventario</span>
              </button>
            )}

            {isTabAllowed('proveedores') && (
              <button
                onClick={() => setActiveTab('proveedores')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'proveedores'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-955 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-955 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Proveedores</span>
              </button>
            )}

            {isTabAllowed('reportes') && (
              <button
                onClick={() => setActiveTab('reportes')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'reportes'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-955 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-955 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Reportes</span>
              </button>
            )}

            {isTabAllowed('cierre') && (
              <button
                onClick={() => setActiveTab('cierre')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'cierre'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-955 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-955 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Cierre de Caja</span>
              </button>
            )}

            {isTabAllowed('usuarios') && (
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'usuarios'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-955 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-955 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Usuarios</span>
              </button>
            )}

            {isTabAllowed('categorias') && (
              <button
                onClick={() => setActiveTab('categorias')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'categorias'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-955 dark:text-white'
                    : 'text-neutral-550 hover:text-neutral-955 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Categorías</span>
              </button>
            )}

            {isTabAllowed('pagos') && (
              <button
                onClick={() => setActiveTab('pagos')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'pagos'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-955 dark:text-white'
                    : 'text-neutral-550 hover:text-neutral-955 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Métodos de Pago</span>
              </button>
            )}
          </nav>
        </div>

        <div className="text-[11px] text-neutral-400 dark:text-neutral-600 font-medium leading-relaxed">
          <p>v0.1 - wireframe</p>
          <p>© Mini Market El Ahorro</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800/80 px-6 flex items-center justify-between z-10 select-none">
          <div className="flex items-center gap-4">
            <h1 className="text-[18px] font-bold text-neutral-900 dark:text-white">{activeHeader.title}</h1>
            <span className="px-2.5 py-0.5 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {activeHeader.badge}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <ThemeToggle />
            
            <div className="flex items-center gap-3 border-l border-neutral-200 dark:border-neutral-800 pl-5">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-neutral-900 dark:text-white">{activeHeader.profile.name}</p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-550">{activeHeader.profile.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-[13px] border border-neutral-300 dark:border-neutral-700">
                {activeHeader.profile.initials}
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 py-1.5 px-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer text-neutral-600 dark:text-neutral-400"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </header>

        <div className="md:hidden flex bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800/80 p-2 overflow-x-auto gap-1 select-none">
          {(['ventas', 'inventario', 'proveedores', 'reportes', 'cierre', 'usuarios', 'categorias'] as const)
            .filter(tab => isTabAllowed(tab))
            .map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-955'
                    : 'text-neutral-550 hover:text-neutral-800'
                }`}
              >
                {tab === 'cierre' ? 'Cierre de Caja' : tab === 'ventas' ? 'Vender' : tab === 'categorias' ? 'Categorías' : tab}
              </button>
            ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 animate-fadeIn">
          {activeTab === 'reportes' && <ReportsView triggerToast={triggerToast} />}
          {activeTab === 'ventas' && <SalesView triggerToast={triggerToast} />}
          {activeTab === 'inventario' && <InventoryView triggerToast={triggerToast} />}
          {activeTab === 'proveedores' && <ProvidersView triggerToast={triggerToast} />}
          {activeTab === 'cierre' && <CierreCajaView triggerToast={triggerToast} />}
          {activeTab === 'usuarios' && <UsersView triggerToast={triggerToast} />}
          {activeTab === 'categorias' && <CategoriesView triggerToast={triggerToast} />}
          {activeTab === 'pagos' && <PaymentMethodsView triggerToast={triggerToast} />}
        </div>
      </main>
    </div>
  );
}
