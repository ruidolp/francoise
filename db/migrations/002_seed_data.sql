-- Migration 002: Datos iniciales

INSERT INTO units (name) VALUES
  ('g'), ('kg'), ('ml'), ('L'),
  ('taza'), ('cdta'), ('cda'), ('unidad'),
  ('pizca'), ('al gusto')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name) VALUES
  ('cebolla'), ('ajo'), ('tomate'), ('zanahoria'), ('papa'),
  ('pollo'), ('carne molida'), ('vacuno'), ('cerdo'), ('atún'),
  ('arroz'), ('fideos'), ('lentejas'), ('porotos'), ('garbanzos'),
  ('aceite'), ('sal'), ('pimienta'), ('comino'), ('orégano'),
  ('leche'), ('huevo'), ('harina'), ('azúcar'), ('mantequilla'),
  ('queso'), ('crema'), ('caldo de pollo'), ('caldo de carne'),
  ('zapallo'), ('pimentón'), ('choclo'), ('limón'), ('perejil'),
  ('cilantro'), ('merkén'), ('ají'), ('palta'), ('apio'), ('puerro')
ON CONFLICT (name) DO NOTHING;
