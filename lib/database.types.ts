export type RequestType =
  | 'feature'
  | 'bug_fix'
  | 'integration'
  | 'maintenance'
  | 'redesign'
  | 'full_system'
  | 'other';
export type RequestStatus =
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'delivered'
  | 'cancelled';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: RequestType;
  priority: 1 | 2 | 3;
  status: RequestStatus;
  budget: string | null;
  payment_deadline: string | null;
  delivery_deadline: string | null;
  admin_notes: string | null;
  client_notes: string | null;
  quoted_at: string | null;
  approved_at: string | null;
  delivered_at: string | null;
  image_url: string | null;
  mp_payment_id: string | null;
  paid_at: string | null;
  paid_manually: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface RequestComment {
  id: string;
  request_id: string;
  user_id: string;
  is_admin: boolean;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export type RequestTaskStatus = 'todo' | 'in_progress' | 'done';

export interface RequestTask {
  id: string;
  request_id: string;
  title: string;
  position: number;
  due_date: string | null;
  status: RequestTaskStatus;
  type: RequestType;
  priority: 1 | 2 | 3;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      requests: {
        Row: Request;
        Insert: Omit<Request, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Request>;
      };
      request_comments: {
        Row: RequestComment;
        Insert: Omit<RequestComment, 'id' | 'created_at'> & { id?: string };
        Update: Partial<RequestComment>;
      };
    };
  };
}
