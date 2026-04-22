"use server"

import { db } from "@/lib/db/client"
import { revalidatePath } from "next/cache"

export async function searchProducts(q: string) {
  return db
    .selectFrom("products")
    .selectAll()
    .where("name", "ilike", `%${q}%`)
    .orderBy("name", "asc")
    .limit(15)
    .execute()
}

export async function getAllProducts() {
  return db.selectFrom("products").selectAll().orderBy("name", "asc").execute()
}

export async function createProduct(name: string) {
  const p = await db
    .insertInto("products")
    .values({ name: name.trim().toLowerCase() })
    .onConflict(oc => oc.column("name").doNothing())
    .returningAll()
    .executeTakeFirst()

  if (!p) {
    return db.selectFrom("products").selectAll().where("name", "=", name.trim().toLowerCase()).executeTakeFirstOrThrow()
  }
  revalidatePath("/productos")
  return p
}

export async function deleteProduct(id: number) {
  await db.deleteFrom("products").where("id", "=", id).execute()
  revalidatePath("/productos")
}

export async function updateProduct(id: number, name: string) {
  const p = await db
    .updateTable("products")
    .set({ name: name.trim().toLowerCase() })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow()
  revalidatePath("/productos")
  return p
}
