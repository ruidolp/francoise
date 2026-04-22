"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { ChevronLeft, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MealSlotButton } from "@/components/meal-slot-button"
import { DishPickerSheet } from "@/components/dish-picker-sheet"
import { getOrCreateWeek, getWeekWithSlots, setMealSlot, clearMealSlot } from "@/lib/actions/weeks"
import {
  getMondayOf, getWeekDays, nextWeek, prevWeek,
  isCurrentWeek, formatWeekRange, formatShortDay,
  DAYS, MEALS, type MealType,
} from "@/lib/utils/week"
import type { Dish } from "@/lib/db/types"

type SlotMap = Record<string, { dish_id: number | null; dish_name: string | null; dish_verified: boolean | null }>

export function WeekPlanner() {
  const [monday, setMonday] = useState(() => getMondayOf(new Date()))
  const [weekId, setWeekId] = useState<number | null>(null)
  const [slots, setSlots] = useState<SlotMap>({})
  const [picker, setPicker] = useState<{ day: number; meal: MealType } | null>(null)
  const [, startTransition] = useTransition()

  const loadWeek = useCallback((mon: Date) => {
    startTransition(async () => {
      const week = await getOrCreateWeek(mon)
      setWeekId(week.id)
      const data = await getWeekWithSlots(week.id)
      const map: SlotMap = {}
      for (const s of data) {
        map[`${s.day_of_week}-${s.meal_type}`] = {
          dish_id: s.dish_id ?? null,
          dish_name: s.dish_name ?? null,
          dish_verified: s.dish_verified ?? null,
        }
      }
      setSlots(map)
    })
  }, [])

  useEffect(() => { loadWeek(monday) }, [monday, loadWeek])

  const days = getWeekDays(monday)

  async function handleSelect(day: number, meal: MealType, dish: Dish) {
    if (!weekId) return
    await setMealSlot(weekId, day, meal, dish.id)
    setSlots(prev => ({
      ...prev,
      [`${day}-${meal}`]: { dish_id: dish.id, dish_name: dish.name, dish_verified: dish.verified },
    }))
  }

  async function handleClear(day: number, meal: MealType) {
    if (!weekId) return
    await clearMealSlot(weekId, day, meal)
    setSlots(prev => {
      const next = { ...prev }
      delete next[`${day}-${meal}`]
      return next
    })
  }

  const isCurrent = isCurrentWeek(monday)

  return (
    <div className="px-3 pt-4 pb-2">
      <h1 className="text-center text-lg font-bold mb-3" style={{ color: "var(--foreground)" }}>FRANCOISE I LOVE U</h1>
      {/* Header semana */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <Button variant="ghost" size="icon" onClick={() => setMonday(prevWeek(monday))}>
          <ChevronLeft size={20} />
        </Button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {formatWeekRange(monday)}
          </span>
          {isCurrent && (
            <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>Esta semana</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isCurrent && (
            <Button variant="ghost" size="icon" onClick={() => setMonday(getMondayOf(new Date()))}>
              <Home size={16} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setMonday(nextWeek(monday))}>
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Grid de días */}
      <div className="space-y-3">
        {days.map((date, idx) => {
          const day = idx + 1
          return (
            <div key={day} className="rounded-2xl p-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="text-sm font-semibold mb-2 capitalize" style={{ color: "var(--primary)" }}>
                {formatShortDay(date)}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MEALS.map(meal => {
                  const slot = slots[`${day}-${meal}`]
                  return (
                    <div key={meal}>
                      <div className="text-[10px] text-center mb-1 capitalize" style={{ color: "var(--muted-foreground)" }}>
                        {meal}
                      </div>
                      <MealSlotButton
                        dishName={slot?.dish_name}
                        verified={slot?.dish_verified}
                        onClick={() => setPicker({ day, meal })}
                        onClear={slot?.dish_id ? () => handleClear(day, meal) : undefined}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <DishPickerSheet
        open={!!picker}
        onClose={() => setPicker(null)}
        title={picker ? `${DAYS[picker.day - 1]} — ${picker.meal}` : ""}
        onSelect={dish => picker && handleSelect(picker.day, picker.meal, dish)}
      />
    </div>
  )
}
