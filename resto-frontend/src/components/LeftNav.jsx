"use client"

import { NavLink } from "react-router-dom"
import { useState, useEffect } from "react"

export default function LeftNav() {
  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState({
    caja: false,
    mesas: false,
    administracion: false,
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile on component mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Navigation structure with categories and nested items
  const navStructure = [
    {
      type: "link",
      to: "/",
      label: "Inicio",
      icon: "🏠",
    },
    {
      type: "category",
      id: "mesas",
      label: "Mesas",
      icon: "🪑",
      items: [{ to: "/mesas/diagrama", label: "Diagrama de Mesas", icon: "📊" }],
    },
    {
      type: "category",
      id: "administracion",
      label: "Administración",
      icon: "📝",
      items: [
        { to: "/productos", label: "Productos", icon: "🍽️" },
        { to: "/categorias", label: "Categorías", icon: "🏷️" },
        { to: "/clientes", label: "Clientes", icon: "👤" },
        { to: "/mesas/abm", label: "Mesas", icon: "📋" },
      ],
    },
    {
      type: "category",
      id: "caja",
      label: "Caja",
      icon: "💰",
      items: [
        { to: "/caja", label: "Control de Caja", icon: "🏦" },
        { to: "/historial-cajas", label: "Historial de Caja", icon: "📆" },
      ],
    },
    {
      type: "link",
      to: "/facturas",
      label: "Facturas",
      icon: "🧾",
    },
    {
      type: "link",
      to: "/reportes",
      label: "Reportes",
      icon: "📊",
    },
  ]

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    })
  }

  // Close menu when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar")
      const hamburger = document.getElementById("hamburger-button")

      if (
        isMobile &&
        isMenuOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        hamburger &&
        !hamburger.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen, isMobile])

  const styles = {
    hamburgerButton: {
      position: "fixed",
      top: "30px",
      left: isMenuOpen ? (isMobile ? "220px" : "220px") : "28px",
      zIndex: 9999,
      background: isMenuOpen ? "rgba(255, 255, 255, 0)" : "#2c3e50",
      border: "none",
      padding: "0px",
      fontSize: "1.5rem",
      color: "white",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 9997,
      opacity: isMenuOpen && isMobile ? 1 : 0,
      visibility: isMenuOpen && isMobile ? "visible" : "hidden",
      transition: "opacity 0.3s ease, visibility 0.3s ease",
    },
    sidebar: {
      width: isMenuOpen ? "280px" : isMobile ? "0" : "80px",
      background: "linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)",
      height: "100vh",
      color: "white",
      boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      overflowX: "hidden",
      overflowY: "auto",
      transition: "all 0.3s ease",
      zIndex: 9998,
      paddingTop: "20px",
    },
    collapsedSidebar: {
      width: "80px",
      background: "linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)",
      height: "100vh",
      color: "white",
      boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
      display: isMobile ? "none" : "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      overflowX: "hidden",
      overflowY: "auto",
      transition: "width 0.3s ease",
      zIndex: 9998,
      paddingTop: "20px",
    },
    logo: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "2rem",
      padding: "0.5rem 0.75rem",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      textAlign: "center",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      transition: "opacity 0.3s ease",
    },
    collapsedLogo: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      marginBottom: "2rem",
      padding: "0.5rem 0",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      textAlign: "center",
      display: isMobile ? "none" : "block",
    },
    navSection: {
      marginBottom: "1.5rem",
      transition: "opacity 0.2s ease",
    },
    sectionTitle: {
      fontSize: "0.75rem",
      textTransform: "uppercase",
      color: "rgba(255, 255, 255, 0.5)",
      marginBottom: "0.75rem",
      paddingLeft: "0.75rem",
      letterSpacing: "0.05em",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    navList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    navItem: {
      marginBottom: "0.25rem",
      borderRadius: "6px",
      overflow: "hidden",
    },
    navLink: (isActive) => ({
      display: "flex",
      alignItems: "center",
      padding: "0.75rem 1rem",
      color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
      textDecoration: "none",
      borderRadius: "6px",
      fontWeight: isActive ? "600" : "normal",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
    collapsedNavLink: (isActive) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.75rem 0",
      color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
      textDecoration: "none",
      borderRadius: "6px",
      fontWeight: isActive ? "600" : "normal",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
      transition: "all 0.2s ease",
      margin: "0 10px",
    }),
    categoryHeader: (isActive) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem 1rem",
      color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: isActive ? "600" : "500",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
    collapsedCategoryHeader: (isActive) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.75rem 0",
      color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: isActive ? "600" : "500",
      transition: "all 0.2s ease",
      margin: "0 10px",
    }),
    categoryContent: {
      display: "flex",
      alignItems: "center",
      width: "100%",
    },
    categoryIcon: {
      marginRight: "0.75rem",
      fontSize: "1.1rem",
      width: "20px",
      textAlign: "center",
    },
    icon: {
      marginRight: isMenuOpen ? "0.75rem" : "0",
      fontSize: "1.1rem",
      width: "20px",
      textAlign: "center",
      transition: "margin 0.3s ease",
    },
    collapsedIcon: {
      fontSize: "1.3rem",
      textAlign: "center",
    },
    chevron: (isExpanded) => ({
      fontSize: "0.8rem",
      transition: "transform 0.3s ease",
      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
      display: isMenuOpen ? "block" : "none",
    }),
    subMenu: {
      listStyle: "none",
      padding: "0.25rem 0 0.25rem 1.5rem",
      margin: 0,
      overflow: "hidden",
      maxHeight: "0",
      transition: "max-height 0.3s ease-out",
      opacity: 0,
    },
    subMenuExpanded: {
      maxHeight: "500px", // Arbitrary large value
      opacity: 1,
      transition: "max-height 0.5s ease-in, opacity 0.3s ease-in",
    },
    subMenuItem: {
      marginBottom: "0.25rem",
    },
    subMenuLink: (isActive) => ({
      display: "flex",
      alignItems: "center",
      padding: "0.5rem 0.75rem",
      color: isActive ? "white" : "rgba(255, 255, 255, 0.6)",
      textDecoration: "none",
      borderRadius: "4px",
      fontWeight: isActive ? "500" : "normal",
      fontSize: "0.9rem",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
    footer: {
      marginTop: "auto",
      fontSize: "0.8rem",
      color: "rgba(255, 255, 255, 0.4)",
      textAlign: "center",
      padding: "1rem 0",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    collapsedFooter: {
      marginTop: "auto",
      fontSize: "0.7rem",
      color: "rgba(255, 255, 255, 0.4)",
      textAlign: "center",
      padding: "1rem 0",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      display: isMobile ? "none" : "block",
    },
    tooltip: {
      position: "absolute",
      left: "90px",
      backgroundColor: "#2c3e50",
      color: "white",
      padding: "5px 10px",
      borderRadius: "4px",
      fontSize: "0.8rem",
      zIndex: 10000,
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      opacity: 0,
      transition: "opacity 0.2s ease",
    },
    tooltipVisible: {
      opacity: 1,
    },
    mainContent: {
      marginLeft: isMobile ? 0 : isMenuOpen ? "280px" : "80px",
      transition: "margin-left 0.3s ease",
      padding: "20px",
    },
  }

  // Helper function to check if a category has any active links
  const isCategoryActive = (items) => {
    return items.some(
      (item) => window.location.pathname === item.to || window.location.pathname.startsWith(item.to + "/"),
    )
  }

  // Tooltip state
  const [tooltip, setTooltip] = useState({ visible: false, text: "", top: 0 })

  // Show tooltip for collapsed menu items
  const showTooltip = (text, e) => {
    if (!isMenuOpen && !isMobile) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltip({
        visible: true,
        text: text,
        top: rect.top + window.scrollY,
      })
    }
  }

  // Hide tooltip
  const hideTooltip = () => {
    setTooltip({ ...tooltip, visible: false })
  }

  // Render navigation items
  const renderNavItems = () => {
    return navStructure.map((item, index) => {
      if (item.type === "link") {
        // Render single link
        return (
          <li key={item.to} style={styles.navItem}>
            {isMenuOpen ? (
              <NavLink to={item.to} style={({ isActive }) => styles.navLink(isActive)} end={item.to === "/"}>
                <span style={styles.icon}>{item.icon}</span>
                {item.label}
              </NavLink>
            ) : (
              <NavLink
                to={item.to}
                style={({ isActive }) => styles.collapsedNavLink(isActive)}
                end={item.to === "/"}
                onMouseEnter={(e) => showTooltip(item.label, e)}
                onMouseLeave={hideTooltip}
              >
                <span style={styles.collapsedIcon}>{item.icon}</span>
              </NavLink>
            )}
          </li>
        )
      } else if (item.type === "category") {
        // Render category with sub-items
        const isExpanded = expandedCategories[item.id]
        const isActive = isCategoryActive(item.items)

        return (
          <li key={item.id} style={styles.navItem}>
            {/* Category header */}
            {isMenuOpen ? (
              <div style={styles.categoryHeader(isActive)} onClick={() => toggleCategory(item.id)}>
                <div style={styles.categoryContent}>
                  <span style={styles.categoryIcon}>{item.icon}</span>
                  {item.label}
                </div>
                <span style={styles.chevron(isExpanded)}>▼</span>
              </div>
            ) : (
              <div
                style={styles.collapsedCategoryHeader(isActive)}
                onClick={() => {
                  if (isMobile) {
                    setIsMenuOpen(true)
                    setTimeout(() => toggleCategory(item.id), 300)
                  } else {
                    setIsMenuOpen(true)
                    setTimeout(() => toggleCategory(item.id), 300)
                  }
                }}
                onMouseEnter={(e) => showTooltip(item.label, e)}
                onMouseLeave={hideTooltip}
              >
                <span style={styles.collapsedIcon}>{item.icon}</span>
              </div>
            )}

            {/* Sub-menu (only render when menu is open) */}
            {isMenuOpen && (
              <ul
                style={{
                  ...styles.subMenu,
                  ...(isExpanded ? styles.subMenuExpanded : {}),
                }}
              >
                {item.items.map((subItem) => (
                  <li key={subItem.to} style={styles.subMenuItem}>
                    <NavLink to={subItem.to} style={({ isActive }) => styles.subMenuLink(isActive)}>
                      <span style={styles.icon}>{subItem.icon}</span>
                      {subItem.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      }
      return null
    })
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        id="hamburger-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={styles.hamburgerButton}
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMenuOpen ? "✕" : "☰"}
      </button>

      {/* Overlay for mobile */}
      <div style={styles.overlay} onClick={() => setIsMenuOpen(false)}></div>

      {/* Tooltip for collapsed menu */}
      {tooltip.visible && !isMenuOpen && !isMobile && (
        <div
          style={{
            ...styles.tooltip,
            ...styles.tooltipVisible,
            top: `${tooltip.top}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Sidebar navigation */}
      <nav id="sidebar" style={styles.sidebar}>
        <div style={isMenuOpen ? styles.logo : styles.collapsedLogo}>{isMenuOpen ? "CHAMUYO" : ""}</div>

        <div style={styles.navSection}>
          {isMenuOpen && <div style={styles.sectionTitle}>Menú Principal</div>}
          <ul style={styles.navList}>{renderNavItems()}</ul>
        </div>

        <div style={isMenuOpen ? styles.footer : styles.collapsedFooter}>
          {isMenuOpen ? (
            <>
              <p>© {new Date().getFullYear()} Restaurant</p>
              <p>v1.0.0</p>
            </>
          ) : (
            <p>©</p>
          )}
        </div>
      </nav>

      {/* Main content wrapper - adjust your app layout to use this */}
      <div style={styles.mainContent}>{/* Your page content goes here */}</div>
    </>
  )
}
