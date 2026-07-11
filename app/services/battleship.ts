/*
|--------------------------------------------------------------------------
| Battleship game logic
|--------------------------------------------------------------------------
|
| Pure, database-agnostic helpers for the multiplayer Battleship mini-game.
| Coordinates use { r, c } with 0 <= r,c < BOARD_SIZE.
|
*/

export const BOARD_SIZE = 8

export interface FleetShip {
  id: string
  name: string
  size: number
}

/**
 * The fleet is intentionally compact so it stays readable on a mobile 8x8 grid.
 */
export const FLEET: FleetShip[] = [
  { id: 'carrier', name: 'Porte-avions', size: 4 },
  { id: 'cruiser', name: 'Croiseur', size: 3 },
  { id: 'destroyer', name: 'Torpilleur', size: 3 },
  { id: 'submarine', name: 'Sous-marin', size: 2 },
]

export interface Cell {
  r: number
  c: number
}

export interface Ship {
  id: string
  cells: Cell[]
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
}

export function cellKey(cell: Cell): string {
  return `${cell.r}-${cell.c}`
}

export function sameCell(a: Cell, b: Cell): boolean {
  return a.r === b.r && a.c === b.c
}

/**
 * Build the ordered list of cells occupied by a ship of `size`, anchored at
 * (r, c) and extending horizontally or vertically.
 */
export function shipCells(r: number, c: number, size: number, orientation: 'h' | 'v'): Cell[] {
  const cells: Cell[] = []
  for (let i = 0; i < size; i++) {
    cells.push(orientation === 'h' ? { r, c: c + i } : { r: r + i, c })
  }
  return cells
}

/**
 * Validate that a submitted fleet matches the expected ships, sits inside the
 * board, forms straight contiguous lines and does not overlap itself.
 */
export function validateFleet(ships: unknown): ships is Ship[] {
  if (!Array.isArray(ships)) return false
  if (ships.length !== FLEET.length) return false

  const occupied = new Set<string>()

  for (const spec of FLEET) {
    const ship = ships.find((s) => s && s.id === spec.id)
    if (!ship) return false
    if (!Array.isArray(ship.cells) || ship.cells.length !== spec.size) return false

    const cells: Cell[] = ship.cells
    for (const cell of cells) {
      if (typeof cell?.r !== 'number' || typeof cell?.c !== 'number' || !inBounds(cell.r, cell.c)) {
        return false
      }
    }

    // Must be a straight line: all same row OR all same column.
    const rows = new Set(cells.map((c) => c.r))
    const cols = new Set(cells.map((c) => c.c))
    const straight = rows.size === 1 || cols.size === 1
    if (!straight) return false

    // Must be contiguous (no gaps).
    const sorted = [...cells].sort((a, b) => a.r - b.r || a.c - b.c)
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const cur = sorted[i]
      const stepOk =
        (rows.size === 1 && cur.c - prev.c === 1) || (cols.size === 1 && cur.r - prev.r === 1)
      if (!stepOk) return false
    }

    // No overlap with previously placed ships.
    for (const cell of cells) {
      const key = cellKey(cell)
      if (occupied.has(key)) return false
      occupied.add(key)
    }
  }

  return true
}

/**
 * Generate a valid random fleet. Retries placement per ship until it fits.
 */
export function randomFleet(): Ship[] {
  const ships: Ship[] = []
  const occupied = new Set<string>()

  for (const spec of FLEET) {
    let placed = false
    let guard = 0
    while (!placed && guard++ < 1000) {
      const orientation: 'h' | 'v' = Math.random() < 0.5 ? 'h' : 'v'
      const maxR = orientation === 'v' ? BOARD_SIZE - spec.size : BOARD_SIZE - 1
      const maxC = orientation === 'h' ? BOARD_SIZE - spec.size : BOARD_SIZE - 1
      const r = Math.floor(Math.random() * (maxR + 1))
      const c = Math.floor(Math.random() * (maxC + 1))
      const cells = shipCells(r, c, spec.size, orientation)
      if (cells.some((cell) => occupied.has(cellKey(cell)))) continue

      cells.forEach((cell) => occupied.add(cellKey(cell)))
      ships.push({ id: spec.id, cells })
      placed = true
    }
  }

  return ships
}

/**
 * All ship cells of a fleet flattened into a set of keys.
 */
export function fleetCellSet(ships: Ship[]): Set<string> {
  const set = new Set<string>()
  ships.forEach((ship) => ship.cells.forEach((cell) => set.add(cellKey(cell))))
  return set
}

/**
 * Return true when every cell of every ship has been hit by `shots`.
 */
export function isFleetDestroyed(ships: Ship[], shots: Cell[]): boolean {
  const shotSet = new Set(shots.map(cellKey))
  return ships.every((ship) => ship.cells.every((cell) => shotSet.has(cellKey(cell))))
}

/**
 * Given the opponent fleet and the shots fired at it, return the ids of ships
 * that are fully sunk.
 */
export function sunkShipIds(ships: Ship[], shots: Cell[]): string[] {
  const shotSet = new Set(shots.map(cellKey))
  return ships
    .filter((ship) => ship.cells.every((cell) => shotSet.has(cellKey(cell))))
    .map((ship) => ship.id)
}
