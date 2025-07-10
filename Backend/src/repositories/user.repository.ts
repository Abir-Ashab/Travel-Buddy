import bcryptjs from "bcryptjs";
import config from "../config";
import { USER_STATUS } from "../interfaces/user.interface";
import { getConnection } from "../database";
import { profile } from "console";

class User {
  private tableName = 'users';

  private get knex() {
    const connection = getConnection();
    if (!connection) {
      throw new Error('Database connection is undefined');
    }
    return connection.getClient!();
  }
  
  async create(userData: any) {
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

  async findById(id : string ) {
    const query = this.knex(this.tableName).where({ id });
    
    return query.first();
  }

  async findByEmail(email: string, includePassword = false) {
    const query = this.knex(this.tableName).where({ email });
    
    if (!includePassword) {
      query.select('*').select(this.knex.raw('NULL as password'));
    }   
    return query.first();
  }

  async createProfilePicture(mediaUrl: string): Promise<void> {
    await this.knex(this.tableName).insert({profile_picture: mediaUrl});
  }

  async findByEmailWithPassword(email: string) {
    return this.knex(this.tableName)
      .where({ email })
      .first();
  }

  async updateById(id: string, updateData: Record<string, any>) {
    const userId = id;
    
    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, Number(config.salt_round));
      updateData.passwordChangedAt = new Date();
    }

    const hasLocationUpdate = updateData.current_latitude !== undefined || 
                            updateData.current_longitude !== undefined;

    if (hasLocationUpdate) {
      if (updateData.current_latitude !== null && updateData.current_longitude !== null) {
        const lat = parseFloat(updateData.current_latitude);
        const lng = parseFloat(updateData.current_longitude);
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error('Invalid coordinates provided');
        }
      }
      
      updateData.location_updated_at = new Date();
    }
    const { geom, ...dataWithoutGeom } = updateData;

    const [updatedUser] = await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        ...dataWithoutGeom,
        updated_at: new Date()
      })
      .returning('*');

    if (hasLocationUpdate && updatedUser && 
        updatedUser.current_latitude !== null && 
        updatedUser.current_longitude !== null) {  
        await this.knex.raw(
          `UPDATE ${this.tableName} SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?`,
          [updatedUser.current_longitude, updatedUser.current_latitude, userId]
        );
    }

    if (updatedUser) {
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    }

    return null;
  }

  async updatePassword(id: string , newPassword: string) {
    const hashedPassword = await bcryptjs.hash(newPassword, Number(config.salt_round));
    
    return this.updateById(id, {
      password: hashedPassword,
      password_changed_at: new Date()
    });
  }

  async findTravelers() {
    return this.knex(this.tableName)
      .select('id', 'name', 'role', 'email', 'status', 'created_at', 'updated_at')
      .where({ role: 'traveler' });
  }

  async findUsers() {
    return this.knex(this.tableName)
      .select('*')
  }

  async deleteById(id : string) {
    console.log("Deleting user with ID:", id);
    return this.knex(this.tableName)
      .where({ id })
      .del();
  }

  async wasPasswordChangedAfter(userId: string, timestamp: string | Date) {
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
export const userModel =  new User();