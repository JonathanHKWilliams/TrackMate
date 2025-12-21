export interface UserProfile {
  user_id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInput {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}
