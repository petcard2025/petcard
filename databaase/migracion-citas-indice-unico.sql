-- =====================================================================
-- OPCIONAL (recomendado): evita que dos personas reserven el MISMO horario
-- con el mismo veterinario al mismo tiempo.
--
-- El backend ya comprueba el horario antes de guardar, pero entre la
-- comprobacion y el guardado dos peticiones simultaneas pueden colarse.
-- Este indice lo impide en la base de datos; el backend ya responde con
-- un mensaje claro (409) si salta.
--
-- NO se ejecuta automaticamente. Correr en el SQL Editor de Supabase,
-- paso por paso.
-- =====================================================================

-- 1) Mira el tipo de las columnas. "hora" deberia ser "time without time zone".
--    Si sale "character varying"/"text", NO crees el indice: las horas guardadas
--    como "08:00 AM" y "08:00" no se detectarian como iguales.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cita' AND column_name IN ('fecha', 'hora', 'estado');

-- 2) Busca duplicados que ya existan (si devuelve filas, el indice fallaria:
--    resuelve primero esas citas, por ejemplo cancelando una de cada par).
SELECT id_veterinario, fecha, hora, COUNT(*) AS cantidad
FROM cita
WHERE estado IS DISTINCT FROM 'Cancelada'
GROUP BY id_veterinario, fecha, hora
HAVING COUNT(*) > 1;

-- 3) Crea el indice. Las citas canceladas no cuentan, asi que su horario queda libre.
CREATE UNIQUE INDEX IF NOT EXISTS cita_horario_unico
  ON cita (id_veterinario, fecha, hora)
  WHERE estado IS DISTINCT FROM 'Cancelada';
