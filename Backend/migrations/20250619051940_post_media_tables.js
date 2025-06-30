export async function up(knex) {
  await knex.schema.createTable('posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('location_id').references('id').inTable('locations').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.decimal('total_cost', 10, 2).notNullable();
    table.integer('duration_days').notNullable();
    table.integer('effort_level').notNullable();
    table.boolean('is_featured').defaultTo(false);
    table.enum('status', ['draft', 'published']).defaultTo('draft');
    table.integer('likes_count').defaultTo(0);
    table.integer('saves_count').defaultTo(0);
    table.integer('shares_count').defaultTo(0);
    table.timestamps(true, true);
  });
  
  await knex.schema.createTable('media', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.string('image_url').notNullable();
  });

  await knex.schema.createTable('post_likes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.unique(['post_id', 'user_id']);
  });

  await knex.schema.createTable('post_saves', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.unique(['post_id', 'user_id']);
  });

  await knex.schema.createTable('post_shares', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('platform').nullable(); // 'facebook', 'twitter', 'whatsapp', 'copy_link'
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('reports', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('reporter_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.enum('reason', ['spam', 'inappropriate', 'false_info']).notNullable();
    table.text('description').nullable();
    table.enum('status', ['pending', 'resolved']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('reports');
  await knex.schema.dropTableIfExists('post_shares');
  await knex.schema.dropTableIfExists('post_saves');
  await knex.schema.dropTableIfExists('post_likes');
  await knex.schema.dropTableIfExists('media');
  await knex.schema.dropTableIfExists('posts');
}