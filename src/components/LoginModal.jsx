import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import styles from './LoginModal.module.css'

export default function LoginModal({ onClose }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ nombreUsuario: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.usuario)
      onClose()
    } catch {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.cerrar} onClick={onClose}>✕</button>

        <h2 className={styles.titulo}>Acceso Admin</h2>
        <p className={styles.subtitulo}>Ingresá tus credenciales</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.campo}>
            <label>Usuario</label>
            <input
              type="text"
              value={form.nombreUsuario}
              onChange={e => setForm({ ...form, nombreUsuario: e.target.value })}
              placeholder="usuario"
              required
            />
          </div>

          <div className={styles.campo}>
            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btnSubmit} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}