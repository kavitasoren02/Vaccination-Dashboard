"use client"

import type React from "react"
import { useMemo, useState, useRef } from "react"
import type { StateData } from "../types"
import { useElementSize } from "../hooks/use-element-size"

type Props = {
    states: StateData[]
    selected: string[]
    onToggle: (code: string) => void
}

const COLORS = [
    "#2563eb",
    "#059669",
    "#dc2626",
    "#7c3aed",
    "#f59e0b",
    "#0ea5e9",
    "#16a34a",
    "#ef4444",
    "#8b5cf6",
    "#f97316",
]

export const ComparisonLineChart: React.FC<Props> = ({ states, selected, onToggle }) => {
    const [open, setOpen] = useState(false)
    const [wrapRef, { width: wrapWidth }] = useElementSize<HTMLDivElement>()
    const svgRef = useRef<SVGSVGElement | null>(null)
    const [hoverIdx, setHoverIdx] = useState<number | null>(null)
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string } | null>(null)

    const byCode = new Map(states.map((s) => [s.code, s]))

    const allDates = useMemo(() => {
        const set = new Set<string>()
        states.forEach((s) => s.series.forEach((p) => set.add(p.date)))
        return Array.from(set).sort()
    }, [states])

    const xPadding = 44
    const yPadding = 28
    const width = Math.max(320, Math.round(wrapWidth)) || 520
    const height = 280

    const maxY = Math.max(1, ...states.flatMap((s) => s.series.map((p) => p.value)))

    const step = (width - xPadding * 2) / Math.max(1, allDates.length - 1)
    const x = (date: string) => {
        const idx = allDates.indexOf(date)
        return xPadding + idx * step
    }
    const y = (val: number) => {
        const t = val / maxY
        return height - yPadding - t * (height - yPadding * 2)
    }

    const selectedStates = selected.length ? selected.map((c) => byCode.get(c)!).filter(Boolean) : states.slice(0, 3)

    function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
        const bounds = svgRef.current?.getBoundingClientRect()
        if (!bounds) return
        const mx = e.clientX - bounds.left
        const idx = Math.round((mx - xPadding) / step)
        const clamped = Math.max(0, Math.min(allDates.length - 1, idx))
        setHoverIdx(clamped)
        const date = allDates[clamped]
        setTooltip({ x: x(date), y: y(maxY), date })
    }
    function onMouseLeave() {
        setHoverIdx(null)
        setTooltip(null)
    }

    return (
        <div ref={wrapRef}>
            {/* Multi-select dropdown */}
            <div className="relative inline-block">
                <button
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
                    onClick={() => setOpen((v) => !v)}
                >
                    {selected.length ? `${selected.length} selected` : "Select states"}
                </button>
                {open && (
                    <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow p-2 max-h-60 overflow-auto">
                        <ul className="space-y-1 text-sm">
                            {states.map((s, i) => {
                                const active = selected.includes(s.code)
                                return (
                                    <li key={s.code}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                checked={active}
                                                onChange={() => onToggle(s.code)}
                                            />
                                            <span className="flex-1 truncate">{s.name}</span>
                                            <span
                                                className="inline-block w-3 h-3 rounded"
                                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                            />
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="mt-4 relative">
                <svg
                    ref={svgRef}
                    width={width}
                    height={height}
                    role="img"
                    aria-label="State comparison line chart"
                    className="w-full"
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                >
                    {/* Axes */}
                    <line x1={xPadding} y1={height - yPadding} x2={width - xPadding} y2={height - yPadding} stroke="#e5e7eb" />
                    <line x1={xPadding} y1={yPadding} x2={xPadding} y2={height - yPadding} stroke="#e5e7eb" />
                    {/* Y ticks */}
                    {[0.25, 0.5, 0.75, 1].map((t) => {
                        const yy = y(t * maxY)
                        return <line key={t} x1={xPadding} y1={yy} x2={width - xPadding} y2={yy} stroke="#f3f4f6" />
                    })}
                    {/* Lines */}
                    {selectedStates.map((s, i) => {
                        const d = s.series.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${x(pt.date)} ${y(pt.value)}`).join(" ")
                        const color = COLORS[i % COLORS.length]
                        return <path key={s.code} d={d} fill="none" stroke={color} strokeWidth={2} />
                    })}
                    {/* Hover points and crosshair */}
                    {hoverIdx !== null && (
                        <>
                            {/* crosshair at hovered date */}
                            <line
                                x1={x(allDates[hoverIdx])}
                                y1={yPadding}
                                x2={x(allDates[hoverIdx])}
                                y2={height - yPadding}
                                stroke="#9ca3af"
                                strokeDasharray="3 3"
                            />
                            {/* points on each selected series */}
                            {selectedStates.map((s, i) => {
                                const pt = s.series.find((p) => p.date === allDates[hoverIdx]) || s.series[s.series.length - 1]
                                const color = COLORS[i % COLORS.length]
                                return <circle key={s.code} cx={x(pt.date)} cy={y(pt.value)} r={3} fill={color} />
                            })}
                        </>
                    )}
                    {/* X labels */}
                    {allDates.map((d, i) => (
                        <text key={d} x={x(d)} y={height - 4} fontSize="10" textAnchor="middle" fill="#6b7280">
                            {i % 2 === 0 ? d.slice(5) : ""}
                        </text>
                    ))}
                    {/* Y labels */}
                    {[0, 0.5, 1].map((t, i) => (
                        <text key={i} x={6} y={y(t * maxY) + 3} fontSize="10" fill="#6b7280">
                            {Math.round((t * maxY) / 1000)}k
                        </text>
                    ))}
                </svg>

                {/* Tooltip */}
                {hoverIdx !== null && tooltip && (
                    <div
                        className="absolute z-10 bg-white border border-gray-200 rounded-md shadow px-3 py-2 text-sm pointer-events-none"
                        style={{ left: Math.min(tooltip.x + 12, width - 180), top: yPadding + 8 }}
                    >
                        <div className="font-medium text-gray-800">{tooltip.date}</div>
                        <div className="mt-1 space-y-1">
                            {selectedStates.map((s, i) => {
                                const color = COLORS[i % COLORS.length]
                                const pt = s.series.find((p) => p.date === tooltip.date) || s.series[s.series.length - 1]
                                return (
                                    <div key={s.code} className="flex items-center gap-2">
                                        <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: color }} />
                                        <span className="text-gray-700">{s.name}</span>
                                        <span className="ml-auto tabular-nums text-gray-600">{pt.value.toLocaleString()}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
