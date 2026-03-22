CREATE TABLE tnt_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  message_type TEXT DEFAULT 'text',
  media_url TEXT DEFAULT '',
  reply_to_id UUID,
  is_removed BOOLEAN DEFAULT FALSE,
  read_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);