/*
 * Client-side helpers for the Battleship placement UI. These mirror the pure
 * logic in app/services/battleship.ts but live here because the server module
 * uses Node subpath imports that Vite cannot resolve. The server re-validates
 * every submitted fleet, so this code is purely about interactivity.
 */

export type Orientation = 'h' | 'v'

export interface Cell {
  r: number
  c: number
}

export interface Ship {
  id: string
  cells: Cell[]
}

export interface FleetShip {
  id: string
  name: string
  size: number
}

export function cellKey(cell: Cell): string {
  return `${cell.r}-${cell.c}`
}

export function inBounds(r: number, c: number, size: number): boolean {
  return r >= 0 && r < size && c >= 0 && c < size
}

export function shipCells(r: number, c: number, length: number, orientation: Orientation): Cell[] {
  const cells: Cell[] = []
  for (let i = 0; i < length; i++) {
    cells.push(orientation === 'h' ? { r, c: c + i } : { r: r + i, c })
  }
  return cells
}

/** Occupied cells across every placed ship. */
export function occupiedSet(ships: Ship[], exceptId?: string): Set<string> {
  const set = new Set<string>()
  ships.forEach((ship) => {
    if (ship.id === exceptId) return
    ship.cells.forEach((cell) => set.add(cellKey(cell)))
  })
  return set
}

/** Can a ship of `length` fit at (r,c) with `orientation` given `occupied`? */
export function canPlace(
  r: number,
  c: number,
  length: number,
  orientation: Orientation,
  boardSize: number,
  occupied: Set<string>
): Cell[] | null {
  const cells = shipCells(r, c, length, orientation)
  for (const cell of cells) {
    if (!inBounds(cell.r, cell.c, boardSize)) return null
    if (occupied.has(cellKey(cell))) return null
  }
  return cells
}

/** Generate a valid random fleet for the given board and fleet spec. */
export function randomFleet(fleet: FleetShip[], boardSize: number): Ship[] {
  const ships: Ship[] = []
  const occupied = new Set<string>()

  for (const spec of fleet) {
    let placed = false
    let guard = 0
    while (!placed && guard++ < 1000) {
      const orientation: Orientation = Math.random() < 0.5 ? 'h' : 'v'
      const maxR = orientation === 'v' ? boardSize - spec.size : boardSize - 1
      const maxC = orientation === 'h' ? boardSize - spec.size : boardSize - 1
      const r = Math.floor(Math.random() * (maxR + 1))
      const c = Math.floor(Math.random() * (maxC + 1))
      const cells = canPlace(r, c, spec.size, orientation, boardSize, occupied)
      if (!cells) continue
      cells.forEach((cell) => occupied.add(cellKey(cell)))
      ships.push({ id: spec.id, cells })
      placed = true
    }
  }
  return ships
}
