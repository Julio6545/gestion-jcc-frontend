import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import styles from './ProductoModal.module.css'

export default function ProductoModal({ producto, categorias, onClose, onGuardado }) {
  const esEdicion = !!producto
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    codigo:      '',
    nombre:      '',
    descripcion: '',
    precioVenta: '',
    activo:      true,
    categoriaId: categorias[0]?.id || '',
  })

  const [imagenes,  setImagenes]  = useState([])
  const [nuevaUrl,  setNuevaUrl]  = useState('')
  const [tabImg,    setTabImg]    = useState('url')
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (producto) {
      setForm({
        codigo:      producto.codigo,
        nombre:      producto.nombre,
        descripcion: producto.descripcion || '',
        precioVenta: producto.precioVenta,
        activo:      producto.activo,
        categoriaId: producto.categoriaId || categorias[0]?.id || '',
      })
      setImagenes(producto.imagenes?.map(i => ({ url: i.url, esPrincipal: i.esPrincipal, origen: 'url' })) || [])
    }
  }, [producto])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  // ─── Agregar por URL ───────────────────────────────────────
  const agregarUrl = () => {
    const url = nuevaUrl.trim()
    if (!url) return
    setImagenes(imgs => [...imgs, { url, esPrincipal: imgs.length === 0, origen: 'url' }])
    setNuevaUrl('')
  }

  // ─── Agregar desde PC ──────────────────────────────────────
  const handleArchivos = (e) => {
    const archivos = Array.from(e.target.files)
    if (!archivos.length) return

    archivos.forEach(archivo => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagenes(imgs => [
          ...imgs,
          {
            url:        ev.target.result, // base64 para preview
            archivo,                      // File object para subir
            esPrincipal: imgs.length === 0,
            origen:     'pc'
          }
        ])
      }
      reader.readAsDataURL(archivo)
    })
    // limpiar input para permitir volver a seleccionar los mismos archivos
    e.target.value = ''
  }

  const eliminarImagen = (index) => {
    setImagenes(imgs => {
      const nuevas = imgs.filter((_, i) => i !== index)
      if (nuevas.length > 0 && !nuevas.some(i => i.esPrincipal))
        nuevas[0].esPrincipal = true
      return nuevas
    })
  }

  const marcarPrincipal = (index) => {
    setImagenes(imgs => imgs.map((img, i) => ({ ...img, esPrincipal: i === index })))
  }

  // ─── Subir imagen de PC al backend y obtener URL ───────────
  const subirArchivo = async (archivo) => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    const res = await api.post('/imagenes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.url
  }

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      // Subir imágenes de PC primero y obtener sus URLs
      const imagenesFinales = await Promise.all(
        imagenes.map(async (img) => {
          if (img.origen === 'pc' && img.archivo) {
            const url = await subirArchivo(img.archivo)
            return { url, esPrincipal: img.esPrincipal }
          }
          return { url: img.url, esPrincipal: img.esPrincipal }
        })
      )

      const payload = {
        ...form,
        precioVenta: parseFloat(form.precioVenta),
        categoriaId: parseInt(form.categoriaId),
        imagenes:    imagenesFinales
      }

      if (esEdicion) {
        await api.put(`/productos/${producto.id}`, payload)
      } else {
        await api.post('/productos', payload)
      }

      onGuardado()
      onClose()
    } catch {
      setError('Error al guardar el producto. Verificá los datos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.cerrar} onClick={onClose}>✕</button>
        <h2 className={styles.titulo}>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Código + Categoría */}
          <div className={styles.fila}>
            <div className={styles.campo}>
              <label>Código</label>
              <input name="codigo" value={form.codigo} onChange={handleChange} required placeholder="Ej: ELEC-001" />
            </div>
            <div className={styles.campo}>
              <label>Categoría</label>
              <select name="categoriaId" value={form.categoriaId} onChange={handleChange}>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Nombre */}
          <div className={styles.campo}>
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Nombre del producto" />
          </div>

          {/* Descripción */}
          <div className={styles.campo}>
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} placeholder="Descripción opcional" />
          </div>

          {/* Precio + Activo */}
          <div className={styles.fila}>
            <div className={styles.campo}>
              <label>Precio de venta (Gs.)</label>
              <input type="number" name="precioVenta" value={form.precioVenta} onChange={handleChange} min="0" required placeholder="0" />
            </div>
            {esEdicion && (
              <div className={`${styles.campo} ${styles.checkCampo}`}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
                  Activo
                </label>
              </div>
            )}
          </div>

          {/* ─── Sección Imágenes ─── */}
          <div className={styles.campo}>
            <label>Imágenes</label>

            {/* Tabs URL / PC */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={tabImg === 'url' ? `${styles.tab} ${styles.tabActivo}` : styles.tab}
                onClick={() => setTabImg('url')}
              >
                🔗 Por URL
              </button>
              <button
                type="button"
                className={tabImg === 'pc' ? `${styles.tab} ${styles.tabActivo}` : styles.tab}
                onClick={() => setTabImg('pc')}
              >
                📁 Desde PC
              </button>
            </div>

            {/* Panel URL */}
            {tabImg === 'url' && (
              <div className={styles.urlPanel}>
                <div className={styles.urlFila}>
                  <input
                    value={nuevaUrl}
                    onChange={e => setNuevaUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarUrl() } }}
                  />
                  <button type="button" className={styles.btnAgregar} onClick={agregarUrl}>
                    + Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Panel PC */}
            {tabImg === 'pc' && (
              <div className={styles.pcPanel}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleArchivos}
                />
                <button
                  type="button"
                  className={styles.btnSeleccionar}
                  onClick={() => fileInputRef.current.click()}
                >
                  📂 Seleccionar imágenes
                </button>
                <p className={styles.pcHint}>Podés seleccionar varias a la vez</p>
              </div>
            )}

            {/* Lista de imágenes agregadas */}
            {imagenes.length > 0 && (
              <ul className={styles.listaImagenes}>
                {imagenes.map((img, i) => (
                  <li key={i} className={styles.itemImagen}>
                    <img src={img.url} alt="" className={styles.thumb} onError={e => e.target.style.opacity = 0.2} />
                    <div className={styles.imgInfo}>
                      <span className={styles.imgNombre}>
                        {img.origen === 'pc' ? `📁 ${img.archivo?.name}` : img.url.substring(0, 40) + (img.url.length > 40 ? '...' : '')}
                      </span>
                      {img.esPrincipal && <span className={styles.badgePrincipal}>✓ Principal</span>}
                    </div>
                    <div className={styles.imgAcciones}>
                      {!img.esPrincipal && (
                        <button type="button" className={styles.btnPrincipal} onClick={() => marcarPrincipal(i)}>
                          Principal
                        </button>
                      )}
                      <button type="button" className={styles.btnQuitar} onClick={() => eliminarImagen(i)}>✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btnSubmit} disabled={cargando}>
            {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>
      </div>
    </div>
  )
}