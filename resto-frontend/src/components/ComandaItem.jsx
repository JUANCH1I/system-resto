"use client"

export default function ComandaItem({ producto, index, onChange, onDelete, comentarioActivo, setComentarioActivo }) {
  const handleFieldChange = (field, value) => {
    onChange(index, { ...producto, [field]: value })
  }

  const toggleComentario = () => {
    setComentarioActivo(comentarioActivo === index ? null : index)
  }

  // Calcular el precio total con descuento
  const precioTotal = (producto.precio_unitario * producto.cantidad - (producto.descuento || 0)).toFixed(2)

  return (
    <div style={styles.comandaItem}>
      {/* Fila principal con toda la información */}
      <div style={styles.mainRow}>
        {/* Información del producto */}
        <div style={styles.productoInfo}>
          <div style={styles.nombreContainer}>
            <span style={styles.productoNombre}>{producto.nombre}</span>
            {producto.comentario && <span style={styles.comentarioIndicator}></span>}
          </div>
          {producto.comentario && !comentarioActivo === index && (
            <div style={styles.comentarioPreview}>
              {producto.comentario.length > 20 ? producto.comentario.substring(0, 20) + "..." : producto.comentario}
            </div>
          )}
        </div>

        {/* Controles de cantidad */}
        <div style={styles.cantidadControl}>
          <button
            style={styles.cantidadBtn}
            onClick={() => handleFieldChange("cantidad", Math.max(1, producto.cantidad - 1))}
          >
            -
          </button>
          <span style={styles.cantidadValor}>{producto.cantidad}</span>
          <button style={styles.cantidadBtn} onClick={() => handleFieldChange("cantidad", producto.cantidad + 1)}>
            +
          </button>
        </div>

        {/* Precio unitario */}
        <div style={styles.precioUnitario}>${producto.precio_unitario}</div>

        {/* Descuento */}
        <div style={styles.descuentoContainer}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={producto.descuento}
            onChange={(e) => handleFieldChange("descuento", Number.parseFloat(e.target.value) || 0)}
            style={styles.descuentoInput}
            placeholder="Desc."
          />
        </div>

        {/* Precio total */}
        <div style={styles.precioTotal}>${precioTotal}</div>

        {/* Acciones */}
        <div style={styles.acciones}>
          <button style={styles.iconBtn(comentarioActivo === index, "#0d6efd")} onClick={toggleComentario}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button style={styles.iconBtn(false, "#dc3545")} onClick={() => onDelete(index)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Área de comentarios (expandible) */}
      {comentarioActivo === index && (
        <div style={styles.comentarioContainer}>
          <textarea
            value={producto.comentario || ""}
            onChange={(e) => handleFieldChange("comentario", e.target.value)}
            placeholder="Instrucciones especiales..."
            style={styles.comentarioTextarea}
          />
        </div>
      )}
    </div>
  )
}

const styles = {
  comandaItem: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 10px",
    borderRadius: "6px",
    backgroundColor: "#f8f9fa",
    marginBottom: "8px",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
  },
  mainRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: "8px",
  },
  productoInfo: {
    flex: "1",
    minWidth: "120px",
    overflow: "hidden",
  },
  nombreContainer: {
    display: "flex",
    alignItems: "center",
  },
  productoNombre: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#212529",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  comentarioIndicator: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#0d6efd",
    marginLeft: "6px",
  },
  comentarioPreview: {
    fontSize: "11px",
    color: "#6c757d",
    fontStyle: "italic",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cantidadControl: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },
  cantidadBtn: {
    width: "22px",
    height: "22px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#e9ecef",
    color: "#495057",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    padding: 0,
  },
  cantidadValor: {
    padding: "0 4px",
    fontSize: "14px",
    fontWeight: "500",
    minWidth: "20px",
    textAlign: "center",
    color: "#212529",
  },
  precioUnitario: {
    fontSize: "14px",
    color: "#495057",
    whiteSpace: "nowrap",
  },
  descuentoContainer: {
    display: "flex",
    alignItems: "center",
  },
  descuentoInput: {
    width: "50px",
    height: "24px",
    padding: "2px 4px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "12px",
  },
  precioTotal: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#212529",
    whiteSpace: "nowrap",
    minWidth: "60px",
    textAlign: "right",
  },
  acciones: {
    display: "flex",
    gap: "4px",
  },
  iconBtn: (active, color) => ({
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: active ? `${color}20` : "#e9ecef",
    color: color,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    transition: "all 0.2s ease",
  }),
  comentarioContainer: {
    marginTop: "6px",
    padding: "6px",
    backgroundColor: "#f0f7ff",
    borderRadius: "4px",
    animation: "fadeIn 0.2s ease",
  },
  comentarioTextarea: {
    width: "100%",
    padding: "6px 8px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    resize: "vertical",
    minHeight: "40px",
    fontSize: "13px",
    backgroundColor: "#fff",
    fontFamily: "inherit",
    color: "#495057",
  },
}
