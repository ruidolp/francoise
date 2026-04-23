import { Generated, Insertable, Selectable, Updateable } from "kysely"

export type DishCategory = "ENSALADA" | "ACOMPAÑAMIENTO" | "FUERTE" | "PLATO_PREPARADO" | "POSTRE"
export type MealSection  = "DESAYUNO" | "ALMUERZO" | "CENA"

export const DISH_CATEGORIES: { value: DishCategory; label: string }[] = [
  { value: "ENSALADA",       label: "Ensalada" },
  { value: "ACOMPAÑAMIENTO", label: "Acompañamiento" },
  { value: "FUERTE",         label: "Plato Fuerte" },
  { value: "PLATO_PREPARADO",label: "Plato Preparado" },
  { value: "POSTRE",         label: "Postre" },
]

export const MEAL_SECTIONS: { value: MealSection; label: string }[] = [
  { value: "DESAYUNO", label: "Desayuno" },
  { value: "ALMUERZO", label: "Almuerzo" },
  { value: "CENA",     label: "Cena" },
]

export interface UnitsTable {
  id:         Generated<number>
  name:       string
  created_at: Generated<Date>
}

export interface ProductsTable {
  id:         Generated<number>
  name:       string
  created_at: Generated<Date>
}

export interface DishesTable {
  id:            Generated<number>
  name:          string
  verified:      Generated<boolean>
  source_url:    string | null
  category:      Generated<DishCategory>
  meal_sections: Generated<MealSection[]>
  created_at:    Generated<Date>
  updated_at:    Generated<Date>
}

export interface DishIngredientsTable {
  id:         Generated<number>
  dish_id:    number
  product_id: number
  quantity:   number | null
  unit_id:    number | null
}

export interface WeeksTable {
  id:         Generated<number>
  start_date: Date
}

export interface MealSlotsTable {
  id:          Generated<number>
  week_id:     number
  day_of_week: number
  meal_type:   "desayuno" | "almuerzo" | "cena"
  dish_id:     number
}

export interface Database {
  units:            UnitsTable
  products:         ProductsTable
  dishes:           DishesTable
  dish_ingredients: DishIngredientsTable
  weeks:            WeeksTable
  meal_slots:       MealSlotsTable
}

export type Unit             = Selectable<UnitsTable>
export type NewUnit          = Insertable<UnitsTable>
export type Product          = Selectable<ProductsTable>
export type NewProduct       = Insertable<ProductsTable>
export type Dish             = Selectable<DishesTable>
export type NewDish          = Insertable<DishesTable>
export type DishIngredient   = Selectable<DishIngredientsTable>
export type NewDishIngredient= Insertable<DishIngredientsTable>
export type Week             = Selectable<WeeksTable>
export type MealSlot         = Selectable<MealSlotsTable>
