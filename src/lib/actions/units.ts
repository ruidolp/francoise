"use server"

import { db } from "@/lib/db/client"
import { revalidatePath } from "next/cache"

export async function getUnits() {
  return db.selectFrom("units").selectAll().orderBy("name", "asc").execute()
}

export async function createUnit(name: string) {
  const u = await db
    .insertInto("units")
    .values({ name: name.trim() })
    .onConflict(oc => oc.column("name").doNothing())
    .returningAll()
    .executeTakeFirst()

  if (!u) {
    return db.selectFrom("units").selectAll().where("name", "=", name.trim()).executeTakeFirstOrThrow()
  }
  revalidatePath("/unidades")
  return u
}

export async function deleteUnit(id: number) {
  await db.deleteFrom("units").where("id", "=", id).execute()
  revalidatePath("/unidades")
}

export async function updateUnit(id: number, name: string) {
  const u = await db
    .updateTable("units")
    .set({ name: name.trim() })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow()
  revalidatePath("/unidades")
  return u
}
