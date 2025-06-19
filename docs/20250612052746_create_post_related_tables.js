export const up = async (knex) => {
  // Create posts table
  await knex.schema.createTable('posts', (table) => {
    table.increments('id').primary(); // using id UUID PRIMARY KEY DEFAULT gen_random_uuid(),I can get hashed value like "a3f57e34-9e91-4cd9-92e3-7e7a5bbdb19a", but now I will get integer value like 1,2,3...
    table.integer('user_id').unsigned().notNullable();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.string('location').notNullable();
    table.json('images').defaultTo('[]');
    table.json('tags').defaultTo('[]');
    table.boolean('is_featured').defaultTo(false);
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('published');
    table.integer('likes_count').defaultTo(0);
    table.integer('saves_count').defaultTo(0);
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  // Create likes table
  await knex.schema.createTable('likes', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('post_id').unsigned().notNullable();
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.unique(['user_id', 'post_id']);
  });

  // Create saved_posts table
  await knex.schema.createTable('saved_posts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('post_id').unsigned().notNullable();
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.unique(['user_id', 'post_id']);
  });

  // Create reports table
  await knex.schema.createTable('reports', (table) => {
    table.increments('id').primary();
    table.integer('reporter_id').unsigned().notNullable();
    table.integer('post_id').unsigned().notNullable();
    table.enum('reason', ['spam', 'inappropriate', 'false_info', 'other']).notNullable();
    table.text('description').nullable();
    table.enum('status', ['pending', 'resolved']).defaultTo('pending');
    table.timestamps(true, true);

    table.foreign('reporter_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('post_id').references('id').inTable('posts').onDelete('CASCADE');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('reports');
  await knex.schema.dropTableIfExists('saved_posts');
  await knex.schema.dropTableIfExists('likes');
  await knex.schema.dropTableIfExists('posts');
};