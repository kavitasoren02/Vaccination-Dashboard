declare module "@svg-maps/india" {
    export interface IndiaMapLocation {
        id: string
        name: string
        path: string
    }

    export interface IndiaMap {
        label: string
        viewBox: string
        locations: IndiaMapLocation[]
    }

    const india: IndiaMap
    export default india
}
