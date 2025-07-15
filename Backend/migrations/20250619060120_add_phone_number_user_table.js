export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');
  const hasColumn = await knex.schema.hasColumn('users', 'number');
  if (!hasColumn) {
    return knex.schema.alterTable('users', (table) => {
      table.string('number').nullable();
    });
  }
}

export async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'number');
  if (hasColumn) {
    return knex.schema.alterTable('users', (table) => {
      table.dropColumn('number');
    });
  }
}
