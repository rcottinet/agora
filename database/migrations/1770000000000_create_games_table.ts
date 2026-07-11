import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.string('invite_code', 100).notNullable().unique()
      // waiting | placement | battle | finished
      table.string('status', 20).notNullable().defaultTo('waiting')
      table.uuid('current_turn_player_id').nullable()
      table.uuid('winner_player_id').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
