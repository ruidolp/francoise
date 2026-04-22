-- Migration 001: Schema inicial
-- Planificador de comidas semanal

CREATE TABLE IF NOT EXISTS units (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dishes (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  verified   BOOLEAN DEFAULT FALSE,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dish_ingredients (
  id         SERIAL PRIMARY KEY,
  dish_id    INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity   NUMERIC(10,2),
  unit_id    INTEGER REFERENCES units(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS weeks (
  id         SERIAL PRIMARY KEY,
  start_date DATE NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS meal_slots (
  id          SERIAL PRIMARY KEY,
  week_id     INTEGER NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type   VARCHAR(10) NOT NULL CHECK (meal_type IN ('desayuno','almuerzo','cena')),
  dish_id     INTEGER REFERENCES dishes(id) ON DELETE SET NULL,
  UNIQUE (week_id, day_of_week, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meal_slots_week       ON meal_slots(week_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_dish ON dish_ingredients(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_prod ON dish_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_products_name_fts     ON products USING gin(to_tsvector('spanish', name));
