import { DateTime } from 'luxon'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import Agora from '#models/agora'
import { randomUUID } from 'node:crypto'

export default class Participant extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  static selfAssignPrimaryKey = true

  @column.dateTime({ autoCreate: true })
  declare joinedAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare agoraId: string

  @hasOne(() => Agora)
  declare agora: HasOne<typeof Agora>

  @beforeCreate()
  static assignUuid(model: Participant) {
    model.id = randomUUID()
  }
}
