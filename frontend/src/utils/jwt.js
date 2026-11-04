// Utilidades simples para JWT en el frontend
export function parseJwt(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(base64).split('').map(function(c){
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export function isTokenValid(token) {
  if (!token) return false
  const payload = parseJwt(token)
  if (!payload) return false
  if (payload.exp && Date.now() >= payload.exp * 1000) return false
  return true
}
