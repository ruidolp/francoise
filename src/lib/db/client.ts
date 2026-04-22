import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import { Database } from "./types"

declare global {
  // eslint-disable-next-line no-var
  var _db: Kysely<Database> | undefined
}

function createDb() {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    }),
  })
}

export const db: Kysely<Database> = globalThis._db ?? createDb()
if (process.env.NODE_ENV !== "production") globalThis._db = db
