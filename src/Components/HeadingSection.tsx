import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Order Now', path: '/order' },
    { name: 'Custom Insert', path: '/insert' },
    { name: 'Selling Report', path: '/selling' },
    { name: 'Client View', path: '/client' },
    { name: 'payment', path: '/payment' },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-green-700 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-wide">MONSUR ENTERPRICE</h1>

        {/* Desktop Navigation */}
        <nav className="hidden gap-6 text-lg md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'font-semibold text-yellow-300' : 'transition hover:text-yellow-200'
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger Button */}
        <button
          aria-label="Toggle navigation menu"
          className="flex flex-col gap-1 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="h-0.5 w-6 bg-white"></span>
          <span className="h-0.5 w-6 bg-white"></span>
          <span className="h-0.5 w-6 bg-white"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="bg-green-800 md:hidden">
          <nav className="flex flex-col items-center gap-4 py-4 text-lg">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-yellow-300' : 'transition hover:text-yellow-200'
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
