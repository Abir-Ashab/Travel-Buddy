// models/user.model.js
import bcryptjs from "bcryptjs";
import config from "../config";
import { USER_STATUS } from "../interfaces/user.interface";

class User {
  constructor(knex) {
    this.knex = knex;
    this.tableName = 'users';
  }

  // pre-save er equivalent: create a new user
  async create(userData) {
    // Hash password before saving (pre-save equivalent)
    const hashedPassword = await bcryptjs.hash(userData.password, Number(config.salt_round));
    
    const userToInsert = {
      ...userData,
      password: hashedPassword,
      status: userData.status || USER_STATUS.ACTIVE
    };

    const [insertedUser] = await this.knex(this.tableName)
      .insert(userToInsert)
      .returning('*');

    const { password, ...userWithoutPassword } = insertedUser;
    return userWithoutPassword;
  }

  async findById(id, includePassword = false) {
    const query = this.knex(this.tableName).where({ id });
    
    if (!includePassword) {
      query.select('*').select(this.knex.raw('NULL as password'));
    }
    
    return query.first();
  }

  // without password
  async findByEmail(email, includePassword = false) {
    const query = this.knex(this.tableName).where({ email });
    
    if (!includePassword) {
      query.select('*').select(this.knex.raw('NULL as password'));
    }
    
    return query.first();
  }

  async findByEmailWithPassword(email) {
    return this.knex(this.tableName)
      .where({ email })
      .first();
  }

  async updateById(id, updateData) {
  const userId = typeof id === 'object' && '_id' in id ? id._id : id;

  // If password is being updated, hash it
  if (updateData.password) {
    updateData.password = await bcryptjs.hash(updateData.password, Number(config.salt_round));
    updateData.passwordChangedAt = new Date();
  }

  const [updatedUser] = await this.knex(this.tableName)
    .where({ id: userId })
    .update({
      ...updateData,
      updated_at: new Date()
    })
    .returning('*');

  // Remove password from returned object
  if (updatedUser) {
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  return null;
}

  // Update password and set passwordChangedAt
  async updatePassword(id, newPassword) {
    const hashedPassword = await bcryptjs.hash(newPassword, Number(config.salt_round));
    
    return this.updateById(id, {
      password: hashedPassword,
      password_changed_at: new Date()
    });
  }

  // Find all users (without passwords)
  async findAll(filters = {}) {
    return this.knex(this.tableName)
      .select('id', 'name', 'role', 'email', 'status', 'password_changed_at', 'created_at', 'updated_at')
      .where(filters);
  }

  // Delete user
  async deleteById(id) {
    return this.knex(this.tableName)
      .where({ id })
      .del();
  }

  // Check if password was changed after a certain date (useful for JWT validation)
  async wasPasswordChangedAfter(userId, timestamp) {
    const user = await this.knex(this.tableName)
      .select('password_changed_at')
      .where({ id: userId })
      .first();

    if (!user || !user.password_changed_at) {
      return false;
    }

    return new Date(user.password_changed_at) > new Date(timestamp);
  }
}

// Create and export a factory function
export const createUserModel = (knex) => new User(knex);

// Or export the class if you prefer
export { User };