import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_players'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.timestamp('joined_at')
      table.timestamp('updated_at')
      table.uuid('game_id').references('id').inTable('games').onDelete('CASCADE')
      table.integer('player_number').notNullable()
      table.string('name', 255).notNullable()
      table.boolean('ready').notNullable().defaultTo(false)
      // JSON encoded arrays
      table.text('ships').notNullable().defaultTo('[]')
      table.text('shots').notNullable().defaultTo('[]')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
