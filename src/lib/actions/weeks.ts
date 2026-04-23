"use server"

import { db } from "@/lib/db/client"
import { startOfWeek, format } from "date-fns"

type MealType = "desayuno" | "almuerzo" | "cena"

export async function getOrCreateWeek(date: Date) {
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  const dateStr = format(monday, "yyyy-MM-dd")

  const existing = await db
    .selectFrom("weeks")
    .selectAll()
    .where("start_date", "=", new Date(dateStr))
    .executeTakeFirst()

  if (existing) return existing

  return db
    .insertInto("weeks")
    .values({ start_date: new Date(dateStr) })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function getWeekWithSlots(weekId: number) {
  return db
    .selectFrom("meal_slots as ms")
    .innerJoin("dishes as d", "d.id", "ms.dish_id")
    .select([
      "ms.id", "ms.day_of_week", "ms.meal_type", "ms.dish_id",
      "d.name as dish_name", "d.verified as dish_verified", "d.category as dish_category",
    ])
    .where("ms.week_id", "=", weekId)
    .execute()
}

export async function addDishToSlot(weekId: number, dayOfWeek: number, mealType: MealType, dishId: number) {
  const existing = await db
    .selectFrom("meal_slots")
    .select("id")
    .where("week_id", "=", weekId)
    .where("day_of_week", "=", dayOfWeek)
    .where("meal_type", "=", mealType)
    .where("dish_id", "=", dishId)
    .executeTakeFirst()

  if (existing) return

  await db
    .insertInto("meal_slots")
    .values({ week_id: weekId, day_of_week: dayOfWeek, meal_type: mealType, dish_id: dishId })
    .execute()
}

export async function removeDishFromSlot(weekId: number, dayOfWeek: number, mealType: MealType, dishId: number) {
  await db
    .deleteFrom("meal_slots")
    .where("week_id", "=", weekId)
    .where("day_of_week", "=", dayOfWeek)
    .where("meal_type", "=", mealType)
    .where("dish_id", "=", dishId)
    .execute()
}
