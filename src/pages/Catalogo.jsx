import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import ProductoCard from '../components/ProductoCard'
import ProductoModal from '../components/ProductoModal'
import ProductoDetalle from '../components/ProductoDetalle'
import s from './Catalogo.module.css'

export default function Catalogo() {
  const { esAdmin } = useAuth()

  const [productos,        setProductos]        = useState([])
  const [categorias,       setCategorias]       = useState([])
  const [categoriaActiva,  setCategoriaActiva]  = useState(null)
  const [busqueda,         setBusqueda]         = useState('')
  const [cargando,         setCargando]         = useState(true)
  const [modalAbierto,     setModalAbierto]     = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [productoDetalle,  setProductoDetalle]  = useState(null)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/productos'),
        api.get('/categorias')
      ])
      setProductos(prodRes.data)
      setCategorias(catRes.data)
    } catch (e) {
      console.error('Error al cargar datos', e)
    } finally {
      setCargando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await api.delete(`/productos/${id}`)
      cargarDatos()
    } catch {
      alert('Error al eliminar el producto.')
    }
  }

  const handleEditar = (producto) => {
    setProductoEditando(producto)
    setModalAbierto(true)
  }

  const handleNuevo = () => {
    setProductoEditando(null)
    setModalAbierto(true)
  }

  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaActiva === null || p.categoriaId === categoriaActiva
    const matchQ   = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                     p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <div className={s.pagina}>
      <Navbar
        categorias={categorias}
        categoriaActiva={categoriaActiva}
        onCategoriaClick={setCategoriaActiva}
      />

      <main className={s.main}>
        <div className={s.topBar}>
          <div className={s.searchWrap}>
            <span className={s.searchIcon}>⌕</span>
            <input
              className={s.search}
              placeholder="Buscar producto o código..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          {esAdmin && (
            <button className={s.btnNuevo} onClick={handleNuevo}>
              + Nuevo producto
            </button>
          )}
        </div>

        <p className={s.contador}>
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
        </p>

        {cargando ? (
          <div className={s.cargando}>
            <div className={s.spinner} />
            <span>Cargando catálogo...</span>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className={s.vacio}>
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          <div className={s.grid}>
            {productosFiltrados.map(p => (
              <ProductoCard
                key={p.id}
                producto={p}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
                onVerDetalle={setProductoDetalle}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <ProductoModal
          producto={productoEditando}
          categorias={categorias}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarDatos}
        />
      )}

      {/* Modal detalle */}
      {productoDetalle && (
        <ProductoDetalle
          producto={productoDetalle}
          onClose={() => setProductoDetalle(null)}
        />
      )}
    </div>
  )
}