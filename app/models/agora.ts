import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import Participant from '#models/participant'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class Agora extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  static selfAssignPrimaryKey = true

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare title: string

  @column()
  declare inviteCode: string

  @hasMany(() => Participant)
  declare participants: HasMany<typeof Participant>

  @beforeCreate()
  static assignUuid(model: Agora) {
    model.id = randomUUID()
  }

  @beforeCreate()
  static assignInviteCode(model: Agora) {
    model.inviteCode =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}
