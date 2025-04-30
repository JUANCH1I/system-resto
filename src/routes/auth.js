import express from 'express'
import { pool } from '../config/db.js'

const authRouter = express.Router()

// Endpoint para iniciar sesión
authRouter.post('/', async (req, res) => {
  const { usuario, password } = req.body
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND password = $2',
      [usuario, password]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    }

    const user = result.rows[0]
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

export default authRouter
