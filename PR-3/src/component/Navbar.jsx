import { NavLink } from 'react-router-dom'

function Navbar({ isDarkMode, toggleTheme }) {
  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        Manav Portfolio
      </NavLink>

      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? 'nav-link active-link' : 'nav-link'
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive ? 'nav-link active-link' : 'nav-link'
          }
        >
          Projects
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? 'nav-link active-link' : 'nav-link'
          }
        >
          Contact
        </NavLink>

        <button
          type="button"
          className="theme-button"
          onClick={toggleTheme}
          aria-label="Toggle light and dark theme"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar