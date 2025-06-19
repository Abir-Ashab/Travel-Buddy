import { Accommodation } from "../interfaces/accomodation.interface"

class AccommodationModel {
  constructor(knex) {
    this.knex = knex;
    this.tableName = 'accommodation';
  }

  async findByPostId(postId: string): Promise<Accommodation[]> {
    return await this.knex(this.tableName)
      .where('post_id', postId)
      .orderBy('check_in_date', 'asc');
  }

  async findById(id: string): Promise<Accommodation | null> {
    const accommodation = await this.knex(this.tableName)
      .where('id', id)
      .first();

    return accommodation || null;
  }

  async create(accommodationData: any): Promise<string> {
    const [accommodation] = await this.knex(this.tableName)
      .insert(accommodationData)
      .returning('id');

    return accommodation.id;
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

export const createAccommodationModel = (knex) => new AccommodationModel(knex);
export { AccommodationModel };