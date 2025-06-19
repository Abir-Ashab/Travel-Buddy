import { Attraction } from '../interfaces/attraction.interface';

class AttractionModel {
  constructor(knex) {
    this.knex = knex;
    this.tableName = 'attractions';
  }

  async findByPostId(postId: string): Promise<Attraction[]> {
    return await this.knex(this.tableName)
      .where('post_id', postId)
      .orderBy('visit_date', 'desc');
  }

  async findById(id: string): Promise<Attraction | null> {
    const attraction = await this.knex(this.tableName)
      .where('id', id)
      .first();

    return attraction || null;
  }

  async create(attractionData: any): Promise<string> {
    const [attraction] = await this.knex(this.tableName)
      .insert(attractionData)
      .returning('id');

    return attraction.id;
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

export const createAttractionModel = (knex) => new AttractionModel(knex);
export { AttractionModel };