<template>
  <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
    <h1>🧪 Prueba de Conexión a API</h1>
    
    <button @click="testConexion" style="padding: 10px 20px; background: blue; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px 0;">
      Probar Conexión
    </button>
    
    <button @click="testRegistro" style="padding: 10px 20px; background: green; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px 0;">
      Probar Registro
    </button>
    
    <button @click="testLogin" style="padding: 10px 20px; background: orange; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px 0;">
      Probar Login
    </button>

    <pre style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin-top: 20px; overflow-auto">{{ resultado }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const resultado = ref('Esperando prueba...')

const testConexion = async () => {
  resultado.value = 'Probando conexión...'
  try {
    const response = await fetch('http://localhost:3000/api/usuarios')
    const data = await response.json()
    resultado.value = JSON.stringify(data, null, 2)
  } catch (error) {
    resultado.value = `ERROR: ${error.message}`
  }
}

const testRegistro = async () => {
  resultado.value = 'Probando registro...'
  try {
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Nombre: 'Test Usuario',
        Correo: 'test@test.com',
        Telefono: '1234567890',
        Contrasena: 'password123',
        Rol: 'cliente'
      })
    })
    const data = await response.json()
    resultado.value = `Status: ${response.status}\n${JSON.stringify(data, null, 2)}`
  } catch (error) {
    resultado.value = `ERROR: ${error.message}`
  }
}

const testLogin = async () => {
  resultado.value = 'Probando login...'
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Correo: 'admin@gmail.com',
        Contrasena: '123456'
      })
    })
    const data = await response.json()
    resultado.value = `Status: ${response.status}\n${JSON.stringify(data, null, 2)}`
  } catch (error) {
    resultado.value = `ERROR: ${error.message}`
  }
}
</script>
