import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import logo from '../assets/logo.png'
import s from './Navbar.module.css'

export default function Navbar({ categorias, categoriaActiva, onCategoriaClick }) {
  const { esAdmin, usuario, logout } = useAuth()
  const [showLogin,  setShowLogin]  = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  const handleCat = (id) => {
    onCategoriaClick(id)
    setMenuAbierto(false)
  }

  const catActualNombre = categoriaActiva === null
    ? 'Todos'
    : categorias.find(c => c.id === categoriaActiva)?.nombre || 'Todos'

  return (
    <>
      <nav className={s.nav}>
        {/* Logo */}
        <div className={s.logo}>
          <img src={logo} alt="Logo" className={s.logoImg} />
        </div>

        {/* Categorías desktop */}
        <ul className={s.catsDesktop}>
          <li className={categoriaActiva === null ? s.activa : ''} onClick={() => handleCat(null)}>
            Todos
          </li>
          {categorias.map(c => (
            <li key={c.id}
              className={categoriaActiva === c.id ? s.activa : ''}
              onClick={() => handleCat(c.id)}
            >
              {c.nombre}
            </li>
          ))}
        </ul>

        {/* Botón categorías mobile */}
        <button className={s.btnCatMobile} onClick={() => setMenuAbierto(v => !v)}>
          <span>{catActualNombre}</span>
          <span className={menuAbierto ? s.chevronUp : s.chevronDown}>▾</span>
        </button>

        {/* Admin */}
        <div className={s.adminZona}>
          {esAdmin ? (
            <div className={s.adminInfo}>
              <span className={s.dot} />
              <span className={s.adminNombre}>{usuario}</span>
              <button className={s.btnLogout} onClick={logout}>Salir</button>
            </div>
          ) : (
            <button className={s.btnLogin} onClick={() => setShowLogin(true)}>Admin</button>
          )}
        </div>
      </nav>

      {/* Dropdown mobile */}
      {menuAbierto && (
        <div className={s.dropdown}>
          <ul className={s.dropList}>
            <li className={categoriaActiva === null ? s.dropActiva : ''} onClick={() => handleCat(null)}>
              Todos
            </li>
            {categorias.map(c => (
              <li key={c.id}
                className={categoriaActiva === c.id ? s.dropActiva : ''}
                onClick={() => handleCat(c.id)}
              >
                {c.nombre}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}