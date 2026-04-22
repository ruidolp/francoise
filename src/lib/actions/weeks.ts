"use server"

import { db } from "@/lib/db/client"
import { startOfWeek, format } from "date-fns"

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
  const slots = await db
    .selectFrom("meal_slots as ms")
    .leftJoin("dishes as d", "d.id", "ms.dish_id")
    .select([
      "ms.id", "ms.day_of_week", "ms.meal_type", "ms.dish_id",
      "d.name as dish_name", "d.verified as dish_verified",
    ])
    .where("ms.week_id", "=", weekId)
    .execute()

  return slots
}

export async function setMealSlot(
  weekId: number,
  dayOfWeek: number,
  mealType: "desayuno" | "almuerzo" | "cena",
  dishId: number | null
) {
  const existing = await db
    .selectFrom("meal_slots")
    .select("id")
    .where("week_id", "=", weekId)
    .where("day_of_week", "=", dayOfWeek)
    .where("meal_type", "=", mealType)
    .executeTakeFirst()

  if (existing) {
    return db
      .updateTable("meal_slots")
      .set({ dish_id: dishId })
      .where("id", "=", existing.id)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  return db
    .insertInto("meal_slots")
    .values({ week_id: weekId, day_of_week: dayOfWeek, meal_type: mealType, dish_id: dishId })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function clearMealSlot(weekId: number, dayOfWeek: number, mealType: "desayuno" | "almuerzo" | "cena") {
  await db
    .deleteFrom("meal_slots")
    .where("week_id", "=", weekId)
    .where("day_of_week", "=", dayOfWeek)
    .where("meal_type", "=", mealType)
    .execute()
}
