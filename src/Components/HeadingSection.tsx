import { NavLink } from 'react-router-dom';

const Header = () => {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Live Match', path: '/live' },
    { name: 'Club List', path: '/clubs' },
    { name: 'Country List', path: '/countries' },
  ];

  return (
    <header className="bg-green-700 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo / App Name */}
        <h1 className="text-2xl font-bold tracking-wide">⚽ Football App</h1>

        {/* Navigation */}
        <nav className="flex gap-6 text-lg">
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
      </div>
    </header>
  );
};

export default Header;
