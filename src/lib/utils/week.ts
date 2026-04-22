import { startOfWeek, addDays, addWeeks, subWeeks, format, isSameWeek } from "date-fns"
import { es } from "date-fns/locale"

export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
export const MEALS = ["desayuno", "almuerzo", "cena"] as const
export type MealType = typeof MEALS[number]

export function getMondayOf(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekDays(monday: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function nextWeek(monday: Date) { return addWeeks(monday, 1) }
export function prevWeek(monday: Date) { return subWeeks(monday, 1) }

export function isCurrentWeek(monday: Date) {
  return isSameWeek(monday, new Date(), { weekStartsOn: 1 })
}

export function formatWeekRange(monday: Date) {
  const sunday = addDays(monday, 6)
  return `${format(monday, "d MMM", { locale: es })} – ${format(sunday, "d MMM yyyy", { locale: es })}`
}

export function formatShortDay(date: Date) {
  return format(date, "EEE d", { locale: es })
}
