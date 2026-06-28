import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const baseLinkStyles = "px-4 py-2 font-medium transition-colors duration-200";
  const activeLinkStyles = "text-blue-600 border-b-2 border-blue-600";
  const inactiveLinkStyles = "text-gray-600 hover:text-blue-600";

  return (
    <nav className="flex gap-4 p-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
