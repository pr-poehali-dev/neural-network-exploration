CREATE TABLE tnt_chat_members (
  chat_id UUID REFERENCES tnt_chats(id),
  user_id UUID REFERENCES tnt_users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT FALSE,
  relationship TEXT DEFAULT 'none',
  PRIMARY KEY (chat_id, user_id)
);