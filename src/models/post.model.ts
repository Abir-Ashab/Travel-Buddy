import config from "../config";
import { 
  Post, 
  PostFilters, 
  PostStatus, 
  ReportReason, 
  ReportStatus 
} from '../interfaces/post.interface';

class PostModel {
  // private readonly tableName = 'posts';
  // private readonly mediaTableName = 'media';
  // private readonly likesTableName = 'post_likes';
  // private readonly savesTableName = 'post_saves';
  // private readonly sharesTableName = 'post_shares';
  // private readonly reportsTableName = 'reports';
  // private knex: any;

  constructor(knex) {
    this.knex = knex;
    this.tableName = 'posts';
    this.mediaTableName = 'media';
    this.likesTableName = 'post_likes';
    this.savesTableName = 'post_saves';
    this.sharesTableName = 'post_shares';
    this.reportsTableName = 'reports';
    this.transportsTableName = 'transport';
    this.accoTable = 'accommodation';
    this.diningTable = 'dining';
    this.attractionTable = 'attractions';
  }

async findPostsWithFilters(
    filters: PostFilters,
    limit: number,
    offset: number
  ): Promise<{ posts: Post[]; total: number }> {
    let baseQuery = this.knex(this.tableName)
      .where('posts.status', PostStatus.PUBLISHED);

    if (filters.location_id) {
      baseQuery = baseQuery.where('posts.location_id', filters.location_id);
    }

    if (filters.country) {
      baseQuery = baseQuery
        .leftJoin('locations', 'posts.location_id', 'locations.id')
        .where('locations.country', 'ilike', `%${filters.country}%`);
    }

    if (filters.region) {
      if (!filters.country) {
        baseQuery = baseQuery.leftJoin('locations', 'posts.location_id', 'locations.id');
      }
      baseQuery = baseQuery.where('locations.region', 'ilike', `%${filters.region}%`);
    }

    if (filters.min_cost !== undefined) {
      baseQuery = baseQuery.where('posts.total_cost', '>=', filters.min_cost);
    }

    if (filters.max_cost !== undefined) {
      baseQuery = baseQuery.where('posts.total_cost', '<=', filters.max_cost);
    }

    if (filters.min_duration !== undefined) {
      baseQuery = baseQuery.where('posts.duration_days', '>=', filters.min_duration);
    }

    if (filters.max_duration !== undefined) {
      baseQuery = baseQuery.where('posts.duration_days', '<=', filters.max_duration);
    }

    if (filters.effort_level !== undefined) {
      baseQuery = baseQuery.where('posts.effort_level', filters.effort_level);
    }

    if (filters.is_featured !== undefined) {
      baseQuery = baseQuery.where('posts.is_featured', filters.is_featured);
    }

    if (filters.user_id) {
      baseQuery = baseQuery.where('posts.user_id', filters.user_id);
    }

    if (filters.search) {
      baseQuery = baseQuery.where(function () {
        this.where('posts.title', 'ilike', `%${filters.search}%`)
          .orWhere('posts.description', 'ilike', `%${filters.search}%`);
        if (!filters.country && !filters.region) {
          this.orWhere('locations.name', 'ilike', `%${filters.search}%`);
        }
      });
    }

    const countQuery = baseQuery.clone().clearSelect().clearOrder().countDistinct('posts.id as count');

    const [{ count }] = await countQuery;
    const total = parseInt(count);

    const posts = await baseQuery
      .select([
        'posts.*',
        'users.name as user_name',
        'users.profile_picture as user_profile_picture',
        'locations.name as location_name',
        'locations.country as location_country',
        'locations.region as location_region'
      ])
      .leftJoin('users', 'posts.user_id', 'users.id')
      .leftJoin('locations', 'posts.location_id', 'locations.id')
      .orderBy('posts.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { posts, total };
}


  async findFeaturedPosts(limit: number): Promise<Post[]> {
    return await this.knex(this.tableName)
      .select([
        'posts.*',
        'users.name as user_name',
        'users.profile_picture as user_profile_picture',
        'locations.name as location_name',
        'locations.country as location_country'
      ])
      .leftJoin('users', 'posts.user_id', 'users.id')
      .leftJoin('locations', 'posts.location_id', 'locations.id')
      .where('posts.is_featured', true)
      .where('posts.status', PostStatus.PUBLISHED)
      .orderBy('posts.created_at', 'desc')
      .limit(limit);
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.knex(this.tableName)
      .where('id', id)
      .first();

    return post || null;
  }

  async findByIdWithDetails(id: string): Promise<any> {
    const post = await this.knex(this.tableName)
      .select([
        'posts.*',
        'users.name as user_name',
        'users.profile_picture as user_profile_picture',
        'users.bio as user_bio',
        'locations.name as location_name',
        'locations.country as location_country',
        'locations.region as location_region',
        'locations.latitude',
        'locations.longitude'
      ])
      .leftJoin('users', 'posts.user_id', 'users.id')
      .leftJoin('locations', 'posts.location_id', 'locations.id')
      .where('posts.id', id)
      .first();

    if (!post) return null;

    const media = await this.knex(this.mediaTableName)
      .select('*')
      .where('post_id', id);
    
    // add accomodation, attraction, dining, transport as like media

    const transport = await this.knex(this.transportsTableName)
      .select('*')
      .where('post_id', id);

    const accommodation = await this.knex(this.accoTable)
      .select('*')
      .where('post_id', id);
    
    const dining = await this.knex(this.diningTable)
      .select('*')
      .where('post_id', id);
    
    const attraction = await this.knex(this.attractionTable)
      .select('*')
      .where('post_id', id);
            
    return {
      ...post,
      media, transport, accommodation, dining, attraction
    };  
  }
  // add 

  async create(postData: any): Promise<string> {
    const [post] = await this.knex(this.tableName)
      .insert({
        ...postData,
        status: postData.status || PostStatus.DRAFT
      })
      .returning('id');

    return post.id;
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

  async createMediaRecords(postId: string, mediaUrls: string[]): Promise<void> {
    const mediaRecords = mediaUrls.map(url => ({
      post_id: postId,
      image_url: url
    }));

    await this.knex(this.mediaTableName).insert(mediaRecords);
  }

  async findLike(postId: string, userId: string): Promise<any> {
    return await this.knex(this.likesTableName)
      .where({ post_id: postId, user_id: userId })
      .first();
  }

  async createLike(postId: string, userId: string): Promise<void> {
    await this.knex(this.likesTableName)
      .insert({
        post_id: postId,
        user_id: userId
      });
  }

  async deleteLike(postId: string, userId: string): Promise<void> {
    await this.knex(this.likesTableName)
      .where({ post_id: postId, user_id: userId })
      .del();
  }

  async incrementLikesCount(postId: string): Promise<Post> {
    await this.knex(this.tableName)
      .where('id', postId)
      .increment('likes_count', 1);

    const post = await this.findById(postId);
    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }
    return post;
  }

  async decrementLikesCount(postId: string): Promise<Post> {
    await this.knex(this.tableName)
      .where('id', postId)
      .decrement('likes_count', 1);

    const post = await this.findById(postId);
    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }
    return post;
  }

  async findSave(postId: string, userId: string): Promise<any> {
    return await this.knex(this.savesTableName)
      .where({ post_id: postId, user_id: userId })
      .first();
  }

  async createSave(postId: string, userId: string): Promise<void> {
    await this.knex(this.savesTableName)
      .insert({
        post_id: postId,
        user_id: userId
      });
  }

  async deleteSave(postId: string, userId: string): Promise<void> {
    await this.knex(this.savesTableName)
      .where({ post_id: postId, user_id: userId })
      .del();
  }

  async incrementSavesCount(postId: string): Promise<Post> {
    await this.knex(this.tableName)
      .where('id', postId)
      .increment('saves_count', 1);

    const post = await this.findById(postId);
    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }
    return post;
  }

  async decrementSavesCount(postId: string): Promise<Post> {
    await this.knex(this.tableName)
      .where('id', postId)
      .decrement('saves_count', 1);

    const post = await this.findById(postId);
    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }
    return post;
  }

  async createShare(postId: string, userId: string, platform?: string): Promise<void> {
    await this.knex(this.sharesTableName)
      .insert({
        post_id: postId,
        user_id: userId,
        platform
      });
  }

  async incrementSharesCount(postId: string): Promise<Post> {
    await this.knex(this.tableName)
      .where('id', postId)
      .increment('shares_count', 1);

        const post = await this.findById(postId);
    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }
    return post;
  }

  async findUserPosts(userId: string, limit: number, offset: number): Promise<{ posts: Post[]; total: number }> {
    const query = this.knex(this.tableName)
      .select([
        'posts.*',
        'locations.name as location_name',
        'locations.country as location_country'
      ])
      .leftJoin('locations', 'posts.location_id', 'locations.id')
      .where('posts.user_id', userId);

    const [{ count }] = await query.clone().count('posts.id as count');
    const total = parseInt(count);

    const posts = await query
      .orderBy('posts.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { posts, total };
  }

  async findUserLikedPosts(userId: string, limit: number, offset: number): Promise<{ posts: Post[]; total: number }> {
    const query = this.knex(this.tableName)
      .select([
        'posts.*',
        'users.name as user_name',
        'users.profile_picture as user_profile_picture',
        'locations.name as location_name',
        'locations.country as location_country',
        'post_likes.created_at as liked_at'
      ])
      .join('post_likes', 'posts.id', 'post_likes.post_id')
      .leftJoin('users', 'posts.user_id', 'users.id')
      .leftJoin('locations', 'posts.location_id', 'locations.id')
      .where('post_likes.user_id', userId)
      .where('posts.status', PostStatus.PUBLISHED);

    const [{ count }] = await query.clone().count('posts.id as count');
    const total = parseInt(count);

    const posts = await query
      .orderBy('post_likes.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { posts, total };
  }

  async findUserSavedPosts(userId: string, limit: number, offset: number): Promise<{ posts: Post[]; total: number }> {
    const query = this.knex(this.tableName)
      .select([
        'posts.*',
        'users.name as user_name',
        'users.profile_picture as user_profile_picture',
        'locations.name as location_name',
        'locations.country as location_country',
        'post_saves.created_at as saved_at'
      ])
      .join('post_saves', 'posts.id', 'post_saves.post_id')
      .leftJoin('users', 'posts.user_id', 'users.id')
      .leftJoin('locations', 'posts.location_id', 'locations.id')
      .where('post_saves.user_id', userId)
      .where('posts.status', PostStatus.PUBLISHED);

    const [{ count }] = await query.clone().count('posts.id as count');
    const total = parseInt(count);

    const posts = await query
      .orderBy('post_saves.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { posts, total };
  }

  async findUserReport(postId: string, reporterId: string): Promise<any> {
    return await this.knex(this.reportsTableName)
      .where({ post_id: postId, reporter_id: reporterId })
      .first();
  }

  async createReport(postId: string, reporterId: string, reason: ReportReason, description?: string): Promise<any> {
    const [report] = await this.knex(this.reportsTableName)
      .insert({
        post_id: postId,
        reporter_id: reporterId,
        reason,
        description,
        status: ReportStatus.PENDING
      })
      .returning('*');

    return report;
  }

  async findReports(limit: number, offset: number, status?: ReportStatus): Promise<{ reports: any[]; total: number }> {
    let query = this.knex(this.reportsTableName)
      .select([
        'reports.*',
        'posts.title as post_title',
        'posts.id as post_id',
        'reporter.name as reporter_name',
        'post_author.name as post_author_name'
      ])
      .leftJoin('posts', 'reports.post_id', 'posts.id')
      .leftJoin('users as reporter', 'reports.reporter_id', 'reporter.id')
      .leftJoin('users as post_author', 'posts.user_id', 'post_author.id');

    if (status) {
      query = query.where('reports.status', status);
    }

    const [{ count }] = await query.clone().count('reports.id as count');
    const total = parseInt(count);

    const reports = await query
      .orderBy('reports.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { reports, total };
  }

  async updateReport(reportId: string, updateData: any): Promise<any> {
    const [report] = await this.knex(this.reportsTableName)
      .where('id', reportId)
      .update(updateData)
      .returning('*');

    return report;
  }
}

export const createPostModel = (knex) => new PostModel(knex);

export { PostModel };