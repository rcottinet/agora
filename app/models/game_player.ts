import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import Game from '#models/game'
import type { Cell, Ship } from '#services/battleship'

/**
 * Columns that hold JSON encoded arrays. SQLite stores them as text, so we
 * serialize on the way in and parse on the way out.
 */
const jsonColumn = {
  prepare: (value: unknown) => JSON.stringify(value ?? []),
  consume: (value: string | null) => {
    if (!value) return []
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  },
}

export default class GamePlayer extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  static selfAssignPrimaryKey = true

  @column.dateTime({ autoCreate: true })
  declare joinedAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare gameId: string

  @column()
  declare playerNumber: number

  @column()
  declare name: string

  @column()
  declare ready: boolean

  /** Ships owned by this player, with their occupied cells. */
  @column(jsonColumn)
  declare ships: Ship[]

  /** Cells this player has fired at on the opponent board. */
  @column(jsonColumn)
  declare shots: Cell[]

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @beforeCreate()
  static assignUuid(model: GamePlayer) {
    model.id = randomUUID()
  }
}
