"use server"

import { db } from "@/lib/db/client"
import { revalidatePath } from "next/cache"
import type { DishCategory, MealSection } from "@/lib/db/types"

export async function getDishes(search?: string) {
  let query = db
    .selectFrom("dishes")
    .selectAll()
    .orderBy("name", "asc")

  if (search) {
    query = query.where("name", "ilike", `%${search}%`)
  }

  return query.execute()
}

export async function getDishWithIngredients(dishId: number) {
  const dish = await db
    .selectFrom("dishes")
    .selectAll()
    .where("id", "=", dishId)
    .executeTakeFirst()

  if (!dish) return null

  const ingredients = await db
    .selectFrom("dish_ingredients as di")
    .innerJoin("products as p", "p.id", "di.product_id")
    .leftJoin("units as u", "u.id", "di.unit_id")
    .select(["di.id", "di.quantity", "p.id as product_id", "p.name as product_name", "u.id as unit_id", "u.name as unit_name"])
    .where("di.dish_id", "=", dishId)
    .execute()

  return { ...dish, ingredients }
}

export async function createDish(
  name: string,
  category: DishCategory = "PLATO_PREPARADO",
  meal_sections: MealSection[] = []
) {
  const dish = await db
    .insertInto("dishes")
    .values({ name: name.trim(), category, meal_sections })
    .returningAll()
    .executeTakeFirstOrThrow()
  revalidatePath("/platos")
  return dish
}

export async function updateDish(id: number, data: {
  name?: string
  verified?: boolean
  source_url?: string
  category?: DishCategory
  meal_sections?: MealSection[]
}) {
  const dish = await db
    .updateTable("dishes")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow()
  revalidatePath("/platos")
  return dish
}

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export async function deleteDish(id: number): Promise<{ ok: true } | { error: string }> {
  const slots = await db
    .selectFrom("meal_slots")
    .select(["day_of_week", "meal_type"])
    .where("dish_id", "=", id)
    .limit(3)
    .execute()

  if (slots.length > 0) {
    const places = slots.map(s => `${DAY_NAMES[s.day_of_week - 1] ?? `día ${s.day_of_week}`} (${s.meal_type})`).join(", ")
    return { error: `Este plato está asignado en: ${places}. Quítalo del planificador antes de eliminarlo.` }
  }

  await db.deleteFrom("dish_ingredients").where("dish_id", "=", id).execute()
  await db.deleteFrom("dishes").where("id", "=", id).execute()
  revalidatePath("/platos")
  return { ok: true }
}

export async function saveDishIngredients(
  dishId: number,
  ingredients: Array<{ product_id: number; quantity?: number | null; unit_id?: number | null }>
) {
  await db.deleteFrom("dish_ingredients").where("dish_id", "=", dishId).execute()

  if (ingredients.length > 0) {
    await db
      .insertInto("dish_ingredients")
      .values(ingredients.map(i => ({
        dish_id: dishId,
        product_id: i.product_id,
        quantity: i.quantity ?? null,
        unit_id: i.unit_id ?? null,
      })))
      .execute()
  }

  await db.updateTable("dishes").set({ verified: true, updated_at: new Date() }).where("id", "=", dishId).execute()
  revalidatePath("/platos")
}
