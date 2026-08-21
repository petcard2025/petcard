// CONFIGURACION DE EXPRESS - CORS, JSON, etc.
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173'

const app = express()

// CORS - Permite peticiones desde el frontend
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Parsear JSON en el body de las peticiones
app.use(express.json())

module.exports = app