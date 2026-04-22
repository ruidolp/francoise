"use server"

import { db } from "@/lib/db/client"
import { revalidatePath } from "next/cache"

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

export async function createDish(name: string) {
  const dish = await db
    .insertInto("dishes")
    .values({ name: name.trim() })
    .returningAll()
    .executeTakeFirstOrThrow()
  revalidatePath("/platos")
  return dish
}

export async function updateDish(id: number, data: { name?: string; verified?: boolean; source_url?: string }) {
  const dish = await db
    .updateTable("dishes")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow()
  revalidatePath("/platos")
  return dish
}

export async function deleteDish(id: number) {
  await db.deleteFrom("dish_ingredients").where("dish_id", "=", id).execute()
  await db.deleteFrom("dishes").where("id", "=", id).execute()
  revalidatePath("/platos")
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
