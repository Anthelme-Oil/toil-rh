export interface DayOff {
  id: number
  date: Date
  name: string
  description: string | null
  isRecurring: boolean
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface CreateDayOffInput {
  date: string
  name: string
  description?: string | null
  isRecurring?: boolean
}

export interface UpdateDayOffInput {
  date?: string
  name?: string
  description?: string | null
  isRecurring?: boolean
}