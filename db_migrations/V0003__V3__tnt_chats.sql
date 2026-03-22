CREATE TABLE tnt_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'private',
  name TEXT,
  avatar_url TEXT DEFAULT '',
  message_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);