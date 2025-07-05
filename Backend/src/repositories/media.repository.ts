import { Media } from "../interfaces/media.interface";
import { getConnection } from '../database';

class MediaModel {
  private tableName = 'media';
  
  private get knex() {
    const connection = getConnection();
    if (!connection) {
      throw new Error('Database connection is undefined');
    }
    return connection.getClient!();
  }

  async findByPostId(postId: string): Promise<Media[]> {
    return await this.knex(this.tableName)
      .where('post_id', postId)
  }

  async findById(id: string): Promise<Media | null> {
    const media = await this.knex(this.tableName)
      .where('id', id)
      .first();

    return media || null;
  }

  async create(mediaData: { post_id: string; image_url: string }): Promise<string> {
    const [media] = await this.knex(this.tableName)
      .insert({
        ...mediaData,
      })
      .returning('id');

    return media.id;
  }

  async update(id: string, updateData: { image_url: string }): Promise<void> {
    await this.knex(this.tableName)
      .where('id', id)
      .update({
        ...updateData,
        updated_at: this.knex.fn.now(),
      });
  }

  async delete(id: string): Promise<boolean> {
    const deletedRows = await this.knex(this.tableName)
      .where('id', id)
      .del();

    return deletedRows > 0;
  }
}

export const mediaModel = new MediaModel();
