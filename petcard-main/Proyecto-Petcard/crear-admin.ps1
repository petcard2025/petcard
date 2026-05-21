$body = @{
    Nombre = "Admin PetCard"
    Correo = "admin@petcard.com"
    Telefono = "3000000000"
    Contrasena = "123456"
    Rol = "administrador"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/usuarios" -Method POST -ContentType "application/json" -Body $body

Write-Host "Status: " $response.StatusCode
Write-Host "Response: " $response.Content
