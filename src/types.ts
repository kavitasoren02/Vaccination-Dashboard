// Data types
export type SeriesPoint = { date: string; value: number }

export type StateData = {
    code: string // e.g., IN-MH
    name: string
    total: number
    dose1: number
    dose2: number
    booster: number
    series: SeriesPoint[]
}

export type DashboardData = {
    updatedAt: string
    states: StateData[]
}
