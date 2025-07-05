// media.interface.ts
export interface Media {
  id: string;
  post_id: string;
  image_url: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateMediaRequest {
  image_url: string;
}

export interface UpdateMediaRequest {
  image_url?: string;
}