import express from 'express'
import cors from 'cors'
import categoriasRouter from './routes/categorias.js'
import productosRouter from './routes/productos.js'
import mesasRouter from './routes/mesas.js'
import comandasRouter from './routes/comandas.js'
import clientesRouter from './routes/clientes.js'
import facturasRouter from './routes/facturas.js'
import cajasRouter from './routes/caja.js'
import authRouter from './routes/auth.js'
import reportesRouter from './routes/reportes.js'

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 3000

app.use('/api/categorias', categoriasRouter)
app.use('/api/productos', productosRouter)
app.use('/api/mesas', mesasRouter)
app.use('/api/comandas', comandasRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/facturas', facturasRouter)
app.use('/api/cajas', cajasRouter)
app.use('/api/login', authRouter)
app.use('/api/reportes', reportesRouter)

app.get('/', (req, res) => {
  res.send('Servidor corriendo')
})

app.listen(port, () => console.log('Servidor en http://localhost:3000'))
