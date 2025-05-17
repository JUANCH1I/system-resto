"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [recordarme, setRecordarme] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación básica
    if (!usuario.trim() || !password.trim()) {
      setError("Por favor complete todos los campos")
      return
    }

    try {
      setLoading(true)
      setError("")

      const res = await axios.post(`${__API_URL__}/login`, {
        usuario,
        password,
      })

      // Guardar en localStorage
      localStorage.setItem("usuario", JSON.stringify(res.data))

      // Si el usuario marcó "recordarme", guardar el nombre de usuario
      if (recordarme) {
        localStorage.setItem("usuarioGuardado", usuario)
      } else {
        localStorage.removeItem("usuarioGuardado")
      }

      navigate("/mesas/diagrama") // Redireccionar al inicio
    } catch (err) {
      console.error("Error de inicio de sesión:", err)
      setError(err.response?.data?.message || "Usuario o contraseña incorrectos. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuario guardado si existe
  useState(() => {
    const usuarioGuardado = localStorage.getItem("usuarioGuardado")
    if (usuarioGuardado) {
      setUsuario(usuarioGuardado)
      setRecordarme(true)
    }
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>🍽️</div>
          <h1 style={styles.appName}>Restaurant App</h1>
        </div>

        <h2 style={styles.title}>Iniciar sesión</h2>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="usuario" style={styles.label}>
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              placeholder="Ingrese su nombre de usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={styles.input}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
                style={styles.checkbox}
                disabled={loading}
              />
              Recordar mi usuario
            </label>
          </div>

          <button
            type="submit"
            style={{
              ...styles.loginButton,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Sistema de Gestión de Restaurante</p>
          <p style={styles.footerVersion}>v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  loginCard: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    padding: "30px",
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "30px",
  },
  logo: {
    fontSize: "48px",
    marginBottom: "10px",
  },
  appName: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "6px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    transition: "border-color 0.2s",
    outline: "none",
  },
  checkboxGroup: {
    marginBottom: "20px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#495057",
    cursor: "pointer",
  },
  checkbox: {
    marginRight: "8px",
  },
  loginButton: {
    padding: "12px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  buttonDisabled: {
    opacity: "0.7",
    cursor: "not-allowed",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px 15px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
    textAlign: "center",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
    color: "#6c757d",
    fontSize: "13px",
  },
  footerText: {
    margin: "0 0 5px 0",
  },
  footerVersion: {
    margin: "0",
    fontSize: "12px",
  },
}
