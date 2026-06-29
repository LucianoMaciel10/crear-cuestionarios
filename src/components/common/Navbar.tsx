import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const baseLinkStyles =
    "px-3 py-2 font-medium transition-colors duration-200 rounded-md";
  const activeLinkStyles =
    "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20";
  const inactiveLinkStyles =
    "text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400";

  return (
    <nav className="flex items-center gap-4 p-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${baseLinkStyles} ${isActive ? activeLinkStyles : inactiveLinkStyles}`
        }
      >
        Materias
      </NavLink>
      <NavLink
        to="/materiales"
        className={({ isActive }) =>
          `${baseLinkStyles} ${isActive ? activeLinkStyles : inactiveLinkStyles}`
        }
      >
        Materiales
      </NavLink>
      <NavLink
        to="/flashcards"
        className={({ isActive }) =>
          `${baseLinkStyles} ${isActive ? activeLinkStyles : inactiveLinkStyles}`
        }
      >
        Flashcards
      </NavLink>
      <NavLink
        to="/estadisticas"
        className={({ isActive }) =>
          `${baseLinkStyles} ${isActive ? activeLinkStyles : inactiveLinkStyles}`
        }
      >
        Estadísticas
      </NavLink>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
