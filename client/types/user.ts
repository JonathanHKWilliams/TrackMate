export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  note_lock_password?: string;
  note_lock_security_question?: string;
  note_lock_security_answer?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInput {
  full_name?: string;
  avatar_url?: string;
  note_lock_password?: string;
  note_lock_security_question?: string;
  note_lock_security_answer?: string;
}
