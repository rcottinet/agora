import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'participants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.timestamp('joined_at')
      table.timestamp('updated_at')
      table.string('name', 255).notNullable()
      table.uuid('agora_id').references('id').inTable('agoras')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
