import { Dining } from "../interfaces/dining.interface";

class DiningModel {
  constructor(knex) {
    this.knex = knex;
    this.tableName = 'dining';
  }

  async findByPostId(postId: string): Promise<Dining[]> {
    return await this.knex(this.tableName)
      .where('post_id', postId)
      .orderBy('visit_date', 'desc');
  }

  async findById(id: string): Promise<Dining | null> {
    const dining = await this.knex(this.tableName)
      .where('id', id)
      .first();

    return dining || null;
  }

  async create(diningData: any): Promise<string> {
    const [dining] = await this.knex(this.tableName)
      .insert(diningData)
      .returning('id');

    return dining.id;
  }

  async update(id: string, updateData: any): Promise<void> {
    await this.knex(this.tableName)
      .where('id', id)
      .update({
        ...updateData,
        updated_at: this.knex.fn.now()
      });
  }

  async delete(id: string): Promise<boolean> {
    const deletedRows = await this.knex(this.tableName)
      .where('id', id)
      .del();

    return deletedRows > 0;
  }
}

export const createDiningModel = (knex) => new DiningModel(knex);
export { DiningModel };