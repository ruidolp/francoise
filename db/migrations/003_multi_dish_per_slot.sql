-- Migration 003: Permitir múltiples platos por slot de comida
-- Elimina el UNIQUE constraint para que (week_id, day_of_week, meal_type) pueda tener múltiples filas

ALTER TABLE meal_slots DROP CONSTRAINT IF EXISTS meal_slots_week_id_day_of_week_meal_type_key;

-- Limpiar filas sin plato (ya no tienen sentido con el nuevo modelo)
DELETE FROM meal_slots WHERE dish_id IS NULL;

-- Ahora dish_id nunca debe ser NULL
ALTER TABLE meal_slots ALTER COLUMN dish_id SET NOT NULL;
