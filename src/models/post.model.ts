import { Post, PostFilters, Like, SavedPost, Report, PostStatus } from '../interfaces/post.interface';

class PostModel {
  constructor(knex: any) {
    this.knex = knex;
    this.tableName = 'posts';
    this.likesTable = 'likes';
    this.savedPostsTable = 'saved_posts';
    this.reportsTable = 'reports';
  }

  private knex: any;
  private tableName: string;
  private likesTable: string;
  private savedPostsTable: string;
  private reportsTable: string;

  async create(postData: Partial<Post>): Promise<Post> {
    const postToInsert = {
      ...postData,
      status: postData.status || PostStatus.PUBLISHED,
      is_featured: postData.is_featured || false,
      likes_count: 0,
      saves_count: 0,
      images: JSON.stringify(postData.images || []),
      tags: JSON.stringify(postData.tags || [])
    };

    const [post] = await this.knex(this.tableName)
      .insert(postToInsert)
      .returning('*');

    return this.formatPost(post);
  }

  async findAll(filters: PostFilters = {}): Promise<Post[]> {
    const { page = 1, limit = 10, ...filterData } = filters;
    const offset = (page - 1) * limit;

    let query = this.knex(this.tableName)
      .select('*')
      .where('status', PostStatus.PUBLISHED);

    if (filterData.location) {
      query = query.whereILike('location', `%${filterData.location}%`);
    }
    if (filterData.tags?.length) {
      query = query.whereRaw('JSON_EXTRACT(tags, "$[*]") REGEXP ?', [filterData.tags.join('|')]);
    }
    if (filterData.is_featured !== undefined) {
      query = query.where('is_featured', filterData.is_featured);
    }

    const posts = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return posts.map(this.formatPost);
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.knex(this.tableName).where({ id }).first();
    return post ? this.formatPost(post) : null;
  }

  async findByUserId(userId: string): Promise<Post[]> {
    const posts = await this.knex(this.tableName)
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
    
    return posts.map(this.formatPost);
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const updateData = { ...data };
    (['images', 'tags'] as (keyof typeof updateData)[]).forEach((key) => {
      const value = updateData[key];
      if (value) {
        updateData[key] = JSON.stringify(value) as any;
      }
    });

    const [post] = await this.knex(this.tableName)
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    return this.formatPost(post);
  }

  async delete(id: string): Promise<void> {
    await this.knex(this.tableName).where({ id }).del();
  }

  async getFeatured(): Promise<Post[]> {
    const posts = await this.knex(this.tableName)
      .where({ is_featured: true, status: PostStatus.PUBLISHED })
      .orderBy('created_at', 'desc');
    
    return posts.map(this.formatPost);
  }

  async getTrending(): Promise<Post[]> {
    const posts = await this.knex(this.tableName)
      .where('status', PostStatus.PUBLISHED)
      .orderBy('likes_count', 'desc')
      .orderBy('created_at', 'desc')
      .limit(20);
    
    return posts.map(this.formatPost);
  }

  // Like operations
  async toggleLike(userId: string, postId: string): Promise<boolean> {
    const existing = await this.knex(this.likesTable)
      .where({ user_id: userId, post_id: postId })
      .first();
    
    if (existing) {
      await this.knex(this.likesTable)
        .where({ user_id: userId, post_id: postId })
        .del();
      await this.knex(this.tableName)
        .where({ id: postId })
        .decrement('likes_count', 1);
      return false;
    } else {
      await this.knex(this.likesTable)
        .insert({ user_id: userId, post_id: postId });
      await this.knex(this.tableName)
        .where({ id: postId })
        .increment('likes_count', 1);
      return true;
    }
  }

  async getLikes(postId: string): Promise<Like[]> {
    return this.knex(this.likesTable)
      .where({ post_id: postId })
      .orderBy('created_at', 'desc');
  }

  async isLikedByUser(userId: string, postId: string): Promise<boolean> {
    const like = await this.knex(this.likesTable)
      .where({ user_id: userId, post_id: postId })
      .first();
    return !!like;
  }

  // Save operations
  async toggleSave(userId: string, postId: string): Promise<boolean> {
    const existing = await this.knex(this.savedPostsTable)
      .where({ user_id: userId, post_id: postId })
      .first();
    
    if (existing) {
      await this.knex(this.savedPostsTable)
        .where({ user_id: userId, post_id: postId })
        .del();
      await this.knex(this.tableName)
        .where({ id: postId })
        .decrement('saves_count', 1);
      return false;
    } else {
      await this.knex(this.savedPostsTable)
        .insert({ user_id: userId, post_id: postId });
      await this.knex(this.tableName)
        .where({ id: postId })
        .increment('saves_count', 1);
      return true;
    }
  }

  async getSavedPosts(userId: string): Promise<Post[]> {
    const posts = await this.knex(this.tableName)
      .join(this.savedPostsTable, `${this.tableName}.id`, `${this.savedPostsTable}.post_id`)
      .where(`${this.savedPostsTable}.user_id`, userId)
      .select(`${this.tableName}.*`)
      .orderBy(`${this.savedPostsTable}.created_at`, 'desc');
    
    return posts.map(this.formatPost);
  }

  async isSavedByUser(userId: string, postId: string): Promise<boolean> {
    const saved = await this.knex(this.savedPostsTable)
      .where({ user_id: userId, post_id: postId })
      .first();
    return !!saved;
  }

  // Report operations
  async createReport(reportData: Partial<Report>): Promise<Report> {
    const [report] = await this.knex(this.reportsTable)
      .insert(reportData)
      .returning('*');
    return report;
  }

  async getReports(postId?: number): Promise<Report[]> {
    let query = this.knex(this.reportsTable);
    
    if (postId) {
      query = query.where({ post_id: postId });
    }
    
    return query.orderBy('created_at', 'desc');
  }

  // Helper method to format post data (parse JSON fields)
  private formatPost(post: any): Post {
    return {
      ...post,
      images: Array.isArray(post.images)
        ? post.images
        : typeof post.images === 'string'
        ? JSON.parse(post.images)
        : [],
      tags: Array.isArray(post.tags)
        ? post.tags
        : typeof post.tags === 'string'
        ? JSON.parse(post.tags)
        : []
    };
  }

  // Get reported posts
  async getReportedPosts(): Promise<Report[]> {
    return this.knex(this.reportsTable)
      .join(this.tableName, `${this.reportsTable}.post_id`, `${this.tableName}.id`)
      .select(`${this.reportsTable}.*`, `${this.tableName}.title`, `${this.tableName}.user_id`)
      .orderBy(`${this.reportsTable}.created_at`, 'desc');
  }

  // Update report status
  async updateReportStatus(reportId: string, status: 'resolved' | 'unresolved'): Promise<Report> {
    const [report] = await this.knex(this.reportsTable)
      .where({ id: reportId })
      .update({ status, updated_at: new Date() })
      .returning('*');
    
    return report;
  }
}

export const createPostModel = (knex: any) => new PostModel(knex);
export { PostModel };
