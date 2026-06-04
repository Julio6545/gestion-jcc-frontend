import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import s from './ProductoCard.module.css'

export default function ProductoCard({ producto, onEditar, onEliminar, onVerDetalle }) {
  const { esAdmin } = useAuth()
  const imagenes = producto.imagenes || []
  const principal = imagenes.findIndex(i => i.esPrincipal)
  const [idx, setIdx] = useState(principal >= 0 ? principal : 0)

  const anterior = (e) => { e.stopPropagation(); setIdx(i => (i === 0 ? imagenes.length - 1 : i - 1)) }
  const siguiente = (e) => { e.stopPropagation(); setIdx(i => (i === imagenes.length - 1 ? 0 : i + 1)) }

  const fmt = (n) => 'Gs. ' + Number(n).toLocaleString('es-PY')

  return (
    <div className={s.card} onClick={() => onVerDetalle(producto)}>
      {/* Imagen */}
      <div className={s.imgWrap}>
        {imagenes.length > 0 ? (
          <img src={imagenes[idx]?.url} alt={producto.nombre} className={s.img} />
        ) : (
          <div className={s.sinImg}>Sin imagen</div>
        )}

        {imagenes.length > 1 && (
          <>
            <button className={`${s.arrow} ${s.arrowL}`} onClick={anterior}>‹</button>
            <button className={`${s.arrow} ${s.arrowR}`} onClick={siguiente}>›</button>
            <div className={s.dots}>
              {imagenes.map((_, i) => (
                <span
                  key={i}
                  className={i === idx ? `${s.dot} ${s.dotOn}` : s.dot}
                  onClick={e => { e.stopPropagation(); setIdx(i) }}
                />
              ))}
            </div>
          </>
        )}

        {!producto.activo && <span className={s.badgeInactivo}>Inactivo</span>}
      </div>

      {/* Info */}
      <div className={s.info}>
        <span className={s.codigo}>{producto.codigo}</span>
        <h3 className={s.nombre}>{producto.nombre}</h3>
        {producto.descripcion && <p className={s.desc}>{producto.descripcion}</p>}
        <p className={s.precio}>{fmt(producto.precioVenta)}</p>
      </div>

      {/* Acciones admin */}
      {esAdmin && (
        <div className={s.acciones} onClick={e => e.stopPropagation()}>
          <button className={s.btnEdit} onClick={() => onEditar(producto)}>Editar</button>
          <button className={s.btnDel}  onClick={() => onEliminar(producto.id)}>Eliminar</button>
        </div>
      )}
    </div>
  )
}