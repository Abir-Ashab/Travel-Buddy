export async function up(knex) {
  await knex.schema.alterTable('accommodation', (table) => {
    table.uuid('location_id').nullable()
      .references('id').inTable('locations')
      .onDelete('SET NULL')
      .index();
  });

  await knex.schema.alterTable('dining', (table) => {
    table.uuid('location_id').nullable()
      .references('id').inTable('locations')
      .onDelete('SET NULL')
      .index();
  });

  await knex.schema.alterTable('attractions', (table) => {
    table.uuid('location_id').nullable()
      .references('id').inTable('locations')
      .onDelete('SET NULL')
      .index();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('accommodation', (table) => {
    table.dropColumn('location_id');
  });

  await knex.schema.alterTable('dining', (table) => {
    table.dropColumn('location_id');
  });

  await knex.schema.alterTable('attractions', (table) => {
    table.dropColumn('location_id');
  });
}
