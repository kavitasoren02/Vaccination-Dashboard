import './App.css'
import { useMemo, useState } from "react"
import dataJson from "./data/india-vaccination.json"
import { VaccinationBarChart } from "./components/vaccination-bar-chart"
import { VaccinationPieChart } from "./components/vaccination-pie-chart"
import { ComparisonLineChart } from "./components/comparison-line-chart"
import type { DashboardData, StateData } from "./types"
import { IndiaMapSvg } from './components/india-map'


function computeTotals(states: StateData[]) {
  return states.reduce(
    (acc, s) => {
      acc.total += s.total
      acc.dose1 += s.dose1
      acc.dose2 += s.dose2
      acc.booster += s.booster
      return acc
    },
    { total: 0, dose1: 0, dose2: 0, booster: 0 },
  )
}

function App() {

  const dashboard: DashboardData = dataJson as DashboardData
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [selectedStates, setSelectedStates] = useState<string[]>([])

  const totals = useMemo(() => computeTotals(dashboard.states), [dashboard.states])
  const maxTotal = useMemo(() => Math.max(...dashboard.states.map((s) => s.total)), [dashboard.states])

  const onToggleStateSelect = (code: string) => {
    setSelectedStates((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">India Vaccination Dashboard</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          <main className="col-span-12 md:col-span-12 lg:col-span-12 space-y-6">
            <section id="overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Total Vaccinations</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{totals.total.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Dose 1</div>
                <div className="mt-1 text-2xl font-semibold text-blue-600">{totals.dose1.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Dose 2</div>
                <div className="mt-1 text-2xl font-semibold text-emerald-600">{totals.dose2.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Booster</div>
                <div className="mt-1 text-2xl font-semibold text-rose-600">{totals.booster.toLocaleString()}</div>
              </div>
            </section>

            <section id="map" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">India Map (State-wise)</h2>
                  <div className="text-xs text-gray-500">Hover to inspect</div>
                </div>
                <div className="mt-2">
                  <IndiaMapSvg
                    states={dashboard.states}
                    hoveredCode={hoveredState}
                    setHoveredCode={setHoveredState}
                    maxTotal={maxTotal}
                  />
                </div>
              </div>
              <div id="bar" className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">Bar Chart by Total Vaccinations</h2>
                  <div className="text-xs text-gray-500">Hover syncs with map</div>
                </div>
                <div className="mt-2">
                  <VaccinationBarChart
                    states={dashboard.states}
                    hoveredCode={hoveredState}
                    setHoveredCode={setHoveredState}
                  />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div id="pie" className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-base font-semibold text-gray-800">Dose Distribution (National)</h2>
                <div className="mt-2">
                  <VaccinationPieChart totals={totals} />
                </div>
              </div>
              <div id="line" className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">Line Comparison</h2>
                  <div className="text-xs text-gray-500">Select states to compare</div>
                </div>
                <div className="mt-3">
                  <ComparisonLineChart
                    states={dashboard.states}
                    selected={selectedStates}
                    onToggle={onToggleStateSelect}
                  />
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
