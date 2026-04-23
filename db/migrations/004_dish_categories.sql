-- Migration 004: Categorías y secciones de comida para platos

ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'PLATO_PREPARADO'
    CHECK (category IN ('ENSALADA','ACOMPAÑAMIENTO','FUERTE','PLATO_PREPARADO','POSTRE')),
  ADD COLUMN IF NOT EXISTS meal_sections TEXT[] NOT NULL DEFAULT '{}';

-- Parche: todos los platos existentes quedan como PLATO_PREPARADO
UPDATE dishes SET category = 'PLATO_PREPARADO', meal_sections = '{}';
