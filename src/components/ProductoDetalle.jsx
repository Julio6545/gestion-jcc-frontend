import { useState } from 'react'
import s from './ProductoDetalle.module.css'

export default function ProductoDetalle({ producto, onClose }) {
  const imagenes = producto.imagenes || []
  const principal = imagenes.findIndex(i => i.esPrincipal)
  const [idx, setIdx]         = useState(principal >= 0 ? principal : 0)
  const [imgZoom, setImgZoom] = useState(false)

  const anterior = (e) => { e?.stopPropagation(); setIdx(i => (i === 0 ? imagenes.length - 1 : i - 1)) }
  const siguiente = (e) => { e?.stopPropagation(); setIdx(i => (i === imagenes.length - 1 ? 0 : i + 1)) }
  const fmt = (n) => 'Gs. ' + Number(n).toLocaleString('es-PY')

  return (
    <>
      <div className={s.overlay} onClick={onClose}>
        <div className={s.modal} onClick={e => e.stopPropagation()}>
          <button className={s.cerrar} onClick={onClose}>✕</button>

          <div className={s.contenido}>
            {/* ── Galería ── */}
            <div className={s.galeria}>
              <div className={s.imgPrincipalWrap}>
                {imagenes.length > 0 ? (
                  <img
                    src={imagenes[idx]?.url}
                    alt={producto.nombre}
                    className={s.imgGrande}
                    onClick={() => setImgZoom(true)}
                    title="Clic para ampliar"
                  />
                ) : (
                  <div className={s.sinImg}>Sin imagen</div>
                )}

                {imagenes.length > 1 && (
                  <>
                    <button className={`${s.arrow} ${s.arrowL}`} onClick={anterior}>‹</button>
                    <button className={`${s.arrow} ${s.arrowR}`} onClick={siguiente}>›</button>
                    <div className={s.dots}>
                      {imagenes.map((_, i) => (
                        <span key={i} className={i === idx ? `${s.dot} ${s.dotOn}` : s.dot}
                          onClick={e => { e.stopPropagation(); setIdx(i) }} />
                      ))}
                    </div>
                  </>
                )}

                {imagenes.length > 0 && (
                  <span className={s.zoomHint}>🔍 Clic para ampliar</span>
                )}
              </div>

              {/* Miniaturas */}
              {imagenes.length > 1 && (
                <div className={s.thumbs}>
                  {imagenes.map((img, i) => (
                    <div key={i}
                      className={i === idx ? `${s.thumb} ${s.thumbOn}` : s.thumb}
                      onClick={() => setIdx(i)}
                    >
                      <img src={img.url} alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className={s.info}>
              <span className={s.codigo}>{producto.codigo}</span>
              <h2 className={s.nombre}>{producto.nombre}</h2>

              {producto.descripcion && (
                <p className={s.descripcion}>{producto.descripcion}</p>
              )}

              <div className={s.sep} />

              <p className={s.precioLabel}>Precio de venta</p>
              <p className={s.precio}>{fmt(producto.precioVenta)}</p>

              {!producto.activo && (
                <span className={s.badgeInactivo}>Producto inactivo</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Zoom pantalla completa ── */}
      {imgZoom && (
        <div className={s.zoomOverlay} onClick={() => setImgZoom(false)}>
          <button className={s.zoomCerrar} onClick={() => setImgZoom(false)}>✕</button>
          <img
            src={imagenes[idx]?.url}
            alt={producto.nombre}
            className={s.zoomImg}
            onClick={e => e.stopPropagation()}
          />
          {imagenes.length > 1 && (
            <>
              <button className={`${s.zoomArrow} ${s.zoomArrowL}`} onClick={e => { e.stopPropagation(); anterior() }}>‹</button>
              <button className={`${s.zoomArrow} ${s.zoomArrowR}`} onClick={e => { e.stopPropagation(); siguiente() }}>›</button>
            </>
          )}
        </div>
      )}
    </>
  )
}