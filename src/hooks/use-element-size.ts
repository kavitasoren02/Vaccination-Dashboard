import { useLayoutEffect, useRef, useState } from "react"

export function useElementSize<T extends HTMLElement>() {
    const ref = useRef<T | null>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) {
                const cr = e.contentRect
                setSize({ width: cr.width, height: cr.height })
            }
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return [ref, size] as const
}
