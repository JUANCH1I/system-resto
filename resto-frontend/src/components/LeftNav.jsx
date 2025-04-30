"use client"

import { NavLink } from "react-router-dom"
import { useState } from "react"

export default function LeftNav() {
  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState({
    caja: false, // Default expanded state for categories
    mesas: false,
    administracion: false,
  })

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
      items: [
        { to: "/mesas/diagrama", label: "Diagrama de Mesas", icon: "📊" },
      ],
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

  const styles = {
    sidebar: {
      width: "240px",
      background: "linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)",
      height: "100vh",
      color: "white",
      boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      overflowY: "auto",
    },
    logo: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "2rem",
      padding: "0.5rem 0.75rem",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      textAlign: "center",
    },
    navSection: {
      marginBottom: "1.5rem",
    },
    sectionTitle: {
      fontSize: "0.75rem",
      textTransform: "uppercase",
      color: "rgba(255, 255, 255, 0.5)",
      marginBottom: "0.75rem",
      paddingLeft: "0.75rem",
      letterSpacing: "0.05em",
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
    }),
    categoryContent: {
      display: "flex",
      alignItems: "center",
    },
    categoryIcon: {
      marginRight: "0.75rem",
      fontSize: "1.1rem",
      width: "20px",
      textAlign: "center",
    },
    icon: {
      marginRight: "0.75rem",
      fontSize: "1.1rem",
      width: "20px",
      textAlign: "center",
    },
    chevron: (isExpanded) => ({
      fontSize: "0.8rem",
      transition: "transform 0.3s ease",
      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
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
    }),
    footer: {
      marginTop: "auto",
      fontSize: "0.8rem",
      color: "rgba(255, 255, 255, 0.4)",
      textAlign: "center",
      padding: "1rem 0",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    },
  }

  // Helper function to check if a category has any active links
  const isCategoryActive = (items) => {
    return items.some(
      (item) => window.location.pathname === item.to || window.location.pathname.startsWith(item.to + "/"),
    )
  }

  // Render navigation items
  const renderNavItems = () => {
    return navStructure.map((item, index) => {
      if (item.type === "link") {
        // Render single link
        return (
          <li key={item.to} style={styles.navItem}>
            <NavLink to={item.to} style={({ isActive }) => styles.navLink(isActive)} end={item.to === "/"}>
              <span style={styles.icon}>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        )
      } else if (item.type === "category") {
        // Render category with sub-items
        const isExpanded = expandedCategories[item.id]
        const isActive = isCategoryActive(item.items)

        return (
          <li key={item.id} style={styles.navItem}>
            {/* Category header */}
            <div style={styles.categoryHeader(isActive)} onClick={() => toggleCategory(item.id)}>
              <div style={styles.categoryContent}>
                <span style={styles.categoryIcon}>{item.icon}</span>
                {item.label}
              </div>
              <span style={styles.chevron(isExpanded)}>▼</span>
            </div>

            {/* Sub-menu */}
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
          </li>
        )
      }
      return null
    })
  }

  return (
    <nav style={styles.sidebar}>
      <div style={styles.logo}>CHAMUYO</div>

      <div style={styles.navSection}>
        <div style={styles.sectionTitle}>Menú Principal</div>
        <ul style={styles.navList}>{renderNavItems()}</ul>
      </div>

      <div style={styles.footer}>
        <p>© {new Date().getFullYear()} Restaurant</p>
        <p>v1.0.0</p>
      </div>
    </nav>
  )
}
