export async function up(knex) {
  await knex.schema.createTable('wishlists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description').nullable();
    table.enum('grouping_type', ['region', 'theme', 'budget', 'season']).notNullable();
    table.boolean('is_public').defaultTo(false);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('wishlist_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('wishlist_id').references('id').inTable('wishlists').onDelete('CASCADE');
    table.uuid('location_id').references('id').inTable('locations').onDelete('CASCADE');
    table.text('notes').nullable();
    table.decimal('estimated_budget', 10, 2).nullable();
    table.integer('priority_level').notNullable();
    table.date('preferred_start_date').nullable();
    table.date('preferred_end_date').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('wishlist_items');
  await knex.schema.dropTableIfExists('wishlists');
}