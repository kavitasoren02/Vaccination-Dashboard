import { useMemo } from "react"
import india from "@svg-maps/india"

type StateDatum = {
    code: string
    name: string
    total: number
    dose1: number
    dose2: number
    booster: number
}

type Props = {
    states: StateDatum[]
    hoveredCode: string | null
    setHoveredCode: (code: string | null) => void
    maxTotal: number
}

function interpolateColor(low: string, high: string, t: number) {
    const lh = low.replace("#", "")
    const hh = high.replace("#", "")
    const lr = Number.parseInt(lh.slice(0, 2), 16)
    const lg = Number.parseInt(lh.slice(2, 4), 16)
    const lb = Number.parseInt(lh.slice(4, 6), 16)
    const hr = Number.parseInt(hh.slice(0, 2), 16)
    const hg = Number.parseInt(hh.slice(2, 4), 16)
    const hb = Number.parseInt(hh.slice(4, 6), 16)
    const r = Math.round(lr + (hr - lr) * t)
    const g = Math.round(lg + (hg - lg) * t)
    const b = Math.round(lb + (hb - lb) * t)
    return `rgb(${r}, ${g}, ${b})`
}

export function IndiaMapSvg({ states, hoveredCode, setHoveredCode, maxTotal }: Props) {
    const byName = useMemo(() => {
        const m = new Map<string, StateDatum>()
        for (const s of states) m.set(s.name, s)
        return m
    }, [states])

    const codeByName = useMemo(() => {
        const m = new Map<string, string>()
        for (const s of states) m.set(s.name, s.code)
        return m
    }, [states])

    const hoveredName = useMemo(() => {
        if (!hoveredCode) return null
        const entry = states.find((s) => s.code === hoveredCode)
        return entry ? entry.name : null
    }, [hoveredCode, states])

    const lowColor = "#dbeafe"
    const highColor = "#1d4ed8"

    const viewBox = (india as any).viewBox || "0 0 1000 1000"
    const locations: Array<{ id: string; name: string; path: string }> = (india as any).locations || []

    return (
        <div className="relative">
            <svg viewBox={viewBox} role="img" aria-label="India state-wise vaccination map" className="w-full h-auto">
                <g>
                    {locations.map((loc) => {
                        const data = byName.get(loc.name)
                        const total = data?.total ?? 0
                        const t = maxTotal > 0 ? Math.max(0, Math.min(1, total / maxTotal)) : 0
                        const fill = interpolateColor(lowColor, highColor, t)
                        const isHovered = hoveredName === loc.name
                        return (
                            <path
                                key={loc.id}
                                d={loc.path}
                                fill={data ? fill : "#f3f4f6" }
                                stroke={isHovered ? "#111827" : "#9ca3af"} 
                                strokeWidth={isHovered ? 1.5 : 0.75}
                                className="transition-colors duration-150 cursor-pointer"
                                onMouseEnter={() => {
                                    const code = codeByName.get(loc.name)
                                    if (code) setHoveredCode(code)
                                }}
                                onMouseLeave={() => setHoveredCode(null)}
                            >
                                <title>
                                    {loc.name}
                                    {data
                                        ? ` • Total: ${data.total.toLocaleString()} • Dose1: ${data.dose1.toLocaleString()} • Dose2: ${data.dose2.toLocaleString()} • Booster: ${data.booster.toLocaleString()}`
                                        : " • No data"}
                                </title>
                            </path>
                        )
                    })}
                </g>
            </svg>

            <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Lower</span>
                    <span>Higher</span>
                </div>
                <svg className="w-full h-3 mt-1" viewBox="0 0 100 10" aria-hidden="true">
                    <defs>
                        <linearGradient id="legend-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={lowColor} />
                            <stop offset="100%" stopColor={highColor} />
                        </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="100" height="10" fill="url(#legend-grad)" rx="2" />
                </svg>
            </div>

            {hoveredName && (
                <div className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">{hoveredName}</span>
                    {byName.get(hoveredName) && (
                        <>
                            {" • "}
                            <span>Total: {byName.get(hoveredName)!.total.toLocaleString()}</span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
