import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';

const sidebarItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Companies', path: '/companies' },
  { name: 'Sites', path: '/sites' },
  { name: 'Order Now', path: '/order-now' },
  { name: 'Product Details', path: '/product-details' },
  { name: 'Contract', path: '/contract' },
  { name: 'Product Categories', path: '/categories' },
  { name: 'Payment Methods', path: '/payment-methods' },
  { name: 'Payments', path: '/payments' },
  { name: 'Total Due', path: '/total-due' },
];

const navbarItems = [
  { name: 'Selling Report', path: '/selling' },
  { name: 'Client Report', path: '/client' },
  { name: 'Payment Report', path: '/payment-report' },
];

const DashboardLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Navbar */}
      <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between bg-emerald-800 px-5 text-white shadow-md lg:hidden">
        <h1 className="text-lg font-bold tracking-wide">MONSUR ENTERPRISE</h1>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-md border border-white/30 px-3 py-2 text-sm font-medium hover:bg-white/10"
        >
          Menu
        </button>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 transform bg-emerald-900 text-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <h1 className="text-xl font-bold tracking-wide">MONSUR ENTERPRISE</h1>
            <p className="text-sm text-emerald-200">Business Management Panel</p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-2xl text-white lg:hidden"
          >
            ×
          </button>
        </div>

        <nav className="mt-6 space-y-1 px-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-md'
                    : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <main className="pt-16 lg:ml-72 lg:pt-20">
        {/* Desktop Navbar */}
        <header className="fixed top-0 right-0 left-72 z-30 hidden h-20 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm lg:flex">
          <nav className="flex items-center gap-2">
            {navbarItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            Admin
          </div>
        </header>

        {/* Page Content */}
        <section className="p-5 lg:p-8">
          <div className="min-h-[calc(100vh-8rem)] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-8">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
