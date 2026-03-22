export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  theme: string;
  is_online: boolean;
  last_seen: string;
  has_partner?: boolean;
  relationship_partner_id?: string | null;
  is_contact?: boolean;
  is_blocked?: boolean;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  media_url: string;
  reply_to_id: string | null;
  is_deleted: boolean;
  is_read: boolean;
  read_by: string[];
  created_at: string;
  sender: { username: string; display_name: string; avatar_url: string };
  is_mine: boolean;
  reactions: Record<string, { count: number; users: string[]; mine: boolean }>;
}

export interface Chat {
  id: string;
  type: string;
  name: string;
  message_count: number;
  partner: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    is_online: boolean;
    last_seen: string | null;
    has_partner: boolean;
  };
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

export type Theme = 'dark' | 'light' | 'blue' | 'green' | 'purple' | 'rose';
