import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import GamePlayer from '#models/game_player'

export type GameStatus = 'waiting' | 'placement' | 'battle' | 'finished'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  static selfAssignPrimaryKey = true

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare inviteCode: string

  @column()
  declare status: GameStatus

  @column()
  declare currentTurnPlayerId: string | null

  @column()
  declare winnerPlayerId: string | null

  @hasMany(() => GamePlayer)
  declare players: HasMany<typeof GamePlayer>

  @beforeCreate()
  static assignUuid(model: Game) {
    model.id = randomUUID()
  }

  @beforeCreate()
  static assignInviteCode(model: Game) {
    model.inviteCode =
      Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
  }
}
