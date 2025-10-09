import type React from "react"
import type { StateData } from "../types"

type Props = {
    states: StateData[]
    hoveredCode: string | null
    setHoveredCode: (code: string | null) => void
}

export const VaccinationBarChart: React.FC<Props> = ({ states, hoveredCode, setHoveredCode }) => {
    const max = Math.max(...states.map((s) => s.total))
    const sorted = [...states].sort((a, b) => b.total - a.total)
    return (
        <div className="w-full">
            <ul className="space-y-2">
                {sorted.map((s) => {
                    const w = `${(s.total / max) * 100}%`
                    const active = hoveredCode === s.code
                    return (
                        <li key={s.code}>
                            <div
                                className="flex items-center justify-between text-sm text-gray-700"
                                aria-label={`${s.name} ${s.total}`}
                            >
                                <span className="mr-2 w-40 truncate">{s.name}</span>
                                <span className="ml-2 tabular-nums">{s.total.toLocaleString()}</span>
                            </div>
                            <div
                                className={`h-3 rounded bg-gray-100 border border-gray-200 overflow-hidden`}
                                onMouseEnter={() => setHoveredCode(s.code)}
                                onMouseLeave={() => setHoveredCode(null)}
                            >
                                <div
                                    className={`h-full ${active ? "bg-blue-600" : "bg-blue-400"} transition-all`}
                                    style={{ width: w }}
                                />
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
