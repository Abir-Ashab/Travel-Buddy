// migrations/001_create_core_tables.js

export async function up(knex) {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Users table with authentication and profile
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.enum('role', ['explorer', 'traveler', 'admin', 'super_admin']).defaultTo('explorer');
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.enum('status', ['active', 'blocked']).defaultTo('active');
    table.text('bio').nullable();
    table.json('travel_preferences').nullable();
    table.string('profile_picture').nullable();
    table.timestamps(true, true);
  });

  // Refresh tokens for JWT auth
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Locations reference table
  await knex.schema.createTable('locations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('country').notNullable();
    table.string('region').notNullable();
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.string('timezone').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Trip status lookup table
  await knex.schema.createTable('trip_status', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable().unique();
    table.string('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Insert default trip statuses with predefined UUIDs
  await knex('trip_status').insert([
    { id: knex.raw('uuid_generate_v4()'), name: 'planning', description: 'Trip is in planning phase' },
    { id: knex.raw('uuid_generate_v4()'), name: 'confirmed', description: 'Trip is confirmed and ready' },
    { id: knex.raw('uuid_generate_v4()'), name: 'ongoing', description: 'Trip is currently happening' },
    { id: knex.raw('uuid_generate_v4()'), name: 'completed', description: 'Trip has been completed' },
    { id: knex.raw('uuid_generate_v4()'), name: 'cancelled', description: 'Trip has been cancelled' }
  ]);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('trip_status');
  await knex.schema.dropTableIfExists('locations');
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}

// migrations/002_create_posts_and_media.js

export async function up(knex) {
  // Main posts table
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

  // Post media (images)
  await knex.schema.createTable('media', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.string('image_url').notNullable();
  });

  // Post interactions - likes, saves, shares
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

  // Reports table
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

// migrations/003_create_travel_experience_tables.js

export async function up(knex) {
  // Transport details
  await knex.schema.createTable('transport', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.string('transport_type').notNullable();
    table.string('provider').notNullable();
    table.decimal('cost', 10, 2).notNullable();
    table.text('notes').nullable();
  });

  // Accommodation details
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

  // Dining experiences
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

  // Attractions visited
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

// migrations/004_create_wishlist_system.js

export async function up(knex) {
  // User wishlists
  await knex.schema.createTable('wishlists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description').nullable();
    table.enum('grouping_type', ['region', 'theme', 'budget', 'season']).notNullable();
    table.boolean('is_public').defaultTo(false);
    table.timestamps(true, true);
  });

  // Wishlist items
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

// migrations/005_create_trip_planning_system.js

export async function up(knex) {
  // Travel plans/trips
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

  // Trip participants
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

  // Trip messages/chat
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

// migrations/006_create_services_and_notifications.js

export async function up(knex) {
  // Service cache for external APIs
  await knex.schema.createTable('service_cache', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('location_id').references('id').inTable('locations').onDelete('CASCADE');
    table.enum('service_type', ['hotel', 'transport', 'restaurant', 'attractions']).notNullable();
    table.json('cached_data').notNullable();
    table.timestamp('cached_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable();
    table.string('cache_key').notNullable();
  });

  // User service bookmarks
  await knex.schema.createTable('user_service_bookmarks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('service_name').notNullable();
    table.enum('service_type', ['hotel', 'restaurant', 'transport']).notNullable();
    table.uuid('location_id').references('id').inTable('locations').onDelete('CASCADE');
    table.json('service_details').notNullable();
    table.string('external_service_id').nullable();
    table.boolean('is_visited').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // User notifications
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('type', ['like', 'save', 'trip_invite', 'match_found', 'wishlist_share']).notNullable();
    table.json('metadata').nullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('user_service_bookmarks');
  await knex.schema.dropTableIfExists('service_cache');
}