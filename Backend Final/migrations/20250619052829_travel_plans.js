export async function up(knex) {
  await knex.schema.createTable('trip_status', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable().unique();
    table.string('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex('trip_status').insert([
    { id: knex.raw('uuid_generate_v4()'), name: 'planning', description: 'Trip is in planning phase' },
    { id: knex.raw('uuid_generate_v4()'), name: 'confirmed', description: 'Trip is confirmed and ready' },
    { id: knex.raw('uuid_generate_v4()'), name: 'ongoing', description: 'Trip is currently happening' },
    { id: knex.raw('uuid_generate_v4()'), name: 'completed', description: 'Trip has been completed' },
    { id: knex.raw('uuid_generate_v4()'), name: 'cancelled', description: 'Trip has been cancelled' }
  ]);

  await knex.schema.createTable('travel_plan', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('creator_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('location_id').references('id').inTable('locations').onDelete('CASCADE');
    table.string('trip_name').notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('total_budget', 10, 2).notNullable();
    table.uuid('status_id').references('id').inTable('trip_status');
    table.integer('max_participants').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('travel_participants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('trip_plan_id').references('id').inTable('travel_plan').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['creator', 'participant']).notNullable();
    table.enum('status', ['invited', 'joined', 'declined']).defaultTo('invited');
    table.timestamp('joined_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.unique(['trip_plan_id', 'user_id']);
  });

  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('trip_plan_id').references('id').inTable('travel_plan').onDelete('CASCADE');
    table.uuid('sender_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('message').notNullable();
    table.json('attachments').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('travel_participants');
  await knex.schema.dropTableIfExists('travel_plan');
}