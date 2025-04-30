import LeftNav from "../components/LeftNav"

export default function MainLayout({ children }) {
  // Estilos mejorados usando el mismo enfoque de estilos en línea
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    mainContent: {
      flex: 1,
      padding: "1.5rem",
      transition: "all 0.3s ease",
      overflowY: "auto",
      maxWidth: "100%",
    },
    contentWrapper: {
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      minHeight: "calc(100vh - 3rem)",
    },
    // Estilos para pantallas pequeñas
    "@media (max-width: 768px)": {
      container: {
        flexDirection: "column",
      },
      mainContent: {
        padding: "1rem",
      },
    },
  }

  // Aplicar estilos responsivos manualmente ya que no podemos usar media queries con estilos en línea
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768
  const containerStyle = {
    ...styles.container,
    ...(isMobile ? { flexDirection: "column" } : {}),
  }
  const mainContentStyle = {
    ...styles.mainContent,
    ...(isMobile ? { padding: "1rem" } : {}),
  }

  return (
    <div style={containerStyle}>
      <LeftNav />
      <main style={mainContentStyle}>
        <div style={styles.contentWrapper}>{children}</div>
      </main>
    </div>
  )
}
