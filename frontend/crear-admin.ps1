$body = @{
    Nombre = "Admin General"
    Correo = "tuadmin@petcard.com"
    Telefono = "3132849355"
    Contrasena = "123456"
    Rol = "administrador"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://localhost:3001/api/usuarios" -Method POST -ContentType "application/json" -Body $body -SkipCertificateCheck

Write-Host "Status: " $response.StatusCode
Write-Host "Response: " $response.Content