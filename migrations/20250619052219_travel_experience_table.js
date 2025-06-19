export async function up(knex) {
  await knex.schema.createTable('transport', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.string('transport_type').notNullable();
    table.string('provider').notNullable();
    table.decimal('cost', 10, 2).notNullable();
    table.text('notes').nullable();
  });
  // sample json body

  await knex.schema.createTable('accommodation', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.enum('accommodation_type', ['hotel', 'hostel', 'airbnb', 'guesthouse']).notNullable();
    table.string('name').notNullable();
    table.decimal('cost_per_night', 10, 2).notNullable();
    table.decimal('rating', 2, 1).notNullable().checkBetween([1, 5]);
    table.text('review').nullable();
    table.text('notes').nullable();
    table.json('amenities').nullable();
    table.date('check_in_date').notNullable();
    table.date('check_out_date').notNullable();
  });

  await knex.schema.createTable('dining', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.string('restaurant_name').notNullable();
    table.string('cuisine_type').notNullable();
    table.enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']).notNullable();
    table.decimal('cost', 10, 2).notNullable();
    table.decimal('rating', 2, 1).notNullable().checkBetween([1, 5]);
    table.text('review').nullable();
    table.json('dishes_tried').nullable();
    table.text('notes').nullable();
    table.date('visit_date').notNullable();
  });

  await knex.schema.createTable('attractions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.string('attraction_name').notNullable();
    table.enum('attraction_type', ['museum', 'monument', 'park', 'beach', 'temple', 'market', 'viewpoint', 'adventure']).notNullable();
    table.decimal('entry_cost', 10, 2).notNullable();
    table.decimal('rating', 2, 1).notNullable().checkBetween([1, 5]);
    table.text('review').nullable();
    table.integer('time_spent_hours').notNullable();
    table.enum('best_time_to_visit', ['morning', 'afternoon', 'evening', 'night']).notNullable();
    table.boolean('recommended').defaultTo(true);
    table.text('tips').nullable();
    table.text('notes').nullable();
    table.date('visit_date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('attractions');
  await knex.schema.dropTableIfExists('dining');
  await knex.schema.dropTableIfExists('accommodation');
  await knex.schema.dropTableIfExists('transport');
}