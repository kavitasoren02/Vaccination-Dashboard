import type React from "react"
import { useMemo, useState } from "react"
import { useElementSize } from "../hooks/use-element-size"

type Props = {
    totals: { dose1: number; dose2: number; booster: number }
}

type Slice = {
    key: "dose1" | "dose2" | "booster"
    label: string
    value: number
    color: string
    start: number
    end: number
    percent: number
}

function arcPath(cx: number, cy: number, r: number, innerR: number, start: number, end: number) {
    const polar = (a: number, rad: number) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]
    const [x0, y0] = polar(start, r)
    const [x1, y1] = polar(end, r)
    const [xi0, yi0] = polar(start, innerR)
    const [xi1, yi1] = polar(end, innerR)
    const largeArc = end - start > Math.PI ? 1 : 0
    return [
        `M ${x0} ${y0}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`,
        `L ${xi1} ${yi1}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi0} ${yi0}`,
        "Z",
    ].join(" ")
}

export const VaccinationPieChart: React.FC<Props> = ({ totals }) => {
    const [containerRef, { width }] = useElementSize<HTMLDivElement>()
    const [hover, setHover] = useState<Slice | null>(null)

    const slices = useMemo(() => {
        const parts = [
            { key: "dose1" as const, label: "Dose 1", value: totals.dose1, color: "#3b82f6" },
            { key: "dose2" as const, label: "Dose 2", value: totals.dose2, color: "#10b981" },
            { key: "booster" as const, label: "Booster", value: totals.booster, color: "#f43f5e" },
        ]
        const sum = parts.reduce((a, b) => a + b.value, 0) || 1
        let start = -Math.PI / 2
        return parts.map((p) => {
            const frac = p.value / sum
            const end = start + frac * Math.PI * 2
            const slice: Slice = {
                ...p,
                start,
                end,
                percent: frac * 100,
            }
            start = end
            return slice
        })
    }, [totals])

    const size = Math.max(160, Math.min(360, Math.round(width))) || 240
    const vb = 200
    const cx = 100
    const cy = 100
    const outerR = 80
    const innerR = 50

    return (
        <div ref={containerRef} className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative" style={{ width: size, height: size }}>
                <svg viewBox={`0 0 ${vb} ${vb}`} role="img" aria-label="Dose distribution pie chart" className="w-full h-full">
                    <title>Dose distribution</title>
                    {slices.map((s) => {
                        const isHover = hover?.key === s.key
                        const r = isHover ? outerR + 5 : outerR
                        const ir = isHover ? innerR - 2 : innerR
                        return (
                            <path
                                key={s.key}
                                d={arcPath(cx, cy, r, ir, s.start, s.end)}
                                fill={s.color}
                                className="transition-all"
                                onMouseEnter={() => setHover(s)}
                                onMouseLeave={() => setHover(null)}
                            />
                        )
                    })}
                </svg>

                {/* Tooltip */}
                {hover && (
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[110%] rounded-md bg-white px-3 py-2 text-sm shadow border border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: hover.color }} />
                            <span className="font-medium text-gray-800">{hover.label}</span>
                            <span className="text-gray-500">{Math.round(hover.percent)}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 text-sm">
                {slices.map((s) => (
                    <div key={s.key} className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: s.color }} />
                        <span className="text-gray-700">{s.label}</span>
                        <span className="text-gray-500">{Math.round(s.percent)}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
