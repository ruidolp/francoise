"use server"

import { db } from "@/lib/db/client"

export async function getShoppingList(weekId: number) {
  const rows = await db
    .selectFrom("meal_slots as ms")
    .innerJoin("dishes as d", "d.id", "ms.dish_id")
    .innerJoin("dish_ingredients as di", "di.dish_id", "d.id")
    .innerJoin("products as p", "p.id", "di.product_id")
    .leftJoin("units as u", "u.id", "di.unit_id")
    .select([
      "p.id as product_id",
      "p.name as product_name",
      "di.quantity",
      "u.name as unit_name",
      "d.name as dish_name",
      "ms.meal_type",
      "ms.day_of_week",
    ])
    .where("ms.week_id", "=", weekId)
    .orderBy("p.name", "asc")
    .execute()

  const map = new Map<number, {
    product_id: number
    product_name: string
    count: number
    quantities: Array<{ qty: number | null; unit: string | null }>
  }>()

  for (const row of rows) {
    if (!map.has(row.product_id)) {
      map.set(row.product_id, {
        product_id: row.product_id,
        product_name: row.product_name,
        count: 0,
        quantities: [],
      })
    }
    const entry = map.get(row.product_id)!
    entry.count++

    const unitKey = row.unit_name ?? "__none__"
    const qty = row.quantity ? Number(row.quantity) : null
    const existing = entry.quantities.find(q => (q.unit ?? "__none__") === unitKey)
    if (existing) {
      existing.qty = existing.qty != null && qty != null ? existing.qty + qty : existing.qty ?? qty
    } else {
      entry.quantities.push({ qty, unit: row.unit_name ?? null })
    }
  }

  return Array.from(map.values()).sort((a, b) => a.product_name.localeCompare(b.product_name))
}
