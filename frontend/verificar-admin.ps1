# Script para verificar y crear admin si es necesario

Write-Host "Verificando base de datos..." -ForegroundColor Yellow

$apiUrl = "http://localhost:3000/api"

# Primero intentar login directo
Write-Host "Intentando login con admin@petcard.com..." -ForegroundColor Cyan

$loginBody = @{
    Correo = "admin@petcard.com"
    Contrasena = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$apiUrl/login" -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "Usuario: $($loginData.usuario.Nombre)" -ForegroundColor Green
    Write-Host "Rol: $($loginData.usuario.Rol)" -ForegroundColor Green
    Write-Host "Email: $($loginData.usuario.Correo)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Login fallido o admin no existe" -ForegroundColor Red
    Write-Host "Creando nuevo admin..." -ForegroundColor Yellow
    
    $createBody = @{
        Nombre = "Admin PetCard"
        Correo = "admin@petcard.com"
        Telefono = "3000000000"
        Contrasena = "123456"
        Rol = "administrador"
    } | ConvertTo-Json
    
    try {
        $createResponse = Invoke-WebRequest -Uri "$apiUrl/usuarios" -Method POST -ContentType "application/json" -Body $createBody -ErrorAction Stop
        $createData = $createResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ Admin creado exitosamente!" -ForegroundColor Green
        Write-Host "Email: $($createData.Correo)" -ForegroundColor Green
        Write-Host "Rol: $($createData.Rol)" -ForegroundColor Green
        
        # Ahora intentar login de nuevo
        Write-Host "`nIntentando login nuevamente..." -ForegroundColor Cyan
        $loginResponse = Invoke-WebRequest -Uri "$apiUrl/login" -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
        $loginData = $loginResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ Login exitoso!" -ForegroundColor Green
        Write-Host "Usuario: $($loginData.usuario.Nombre)" -ForegroundColor Green
        Write-Host "Rol: $($loginData.usuario.Rol)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n💡 Credenciales de Admin:" -ForegroundColor Cyan
Write-Host "Email: admin@petcard.com" -ForegroundColor Yellow
Write-Host "Contraseña: 123456" -ForegroundColor Yellow
