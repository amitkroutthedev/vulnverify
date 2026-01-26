-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (Clerk user IDs are strings, not UUIDs)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY, -- Clerk user ID
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  tech_stack TEXT,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Message embeddings table
CREATE TABLE IF NOT EXISTS message_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  embedding vector(768), -- Google text-embedding-004 uses 768 dimensions
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_chat_id ON message_embeddings(chat_id);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector 
ON message_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_messages(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_user_id VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE (
  message_id uuid,
  chat_id uuid,
  content text,
  role text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.message_id,
    me.chat_id,
    m.content,
    m.role,
    1 - (me.embedding <=> query_embedding) as similarity
  FROM message_embeddings me
  JOIN messages m ON m.id = me.message_id
  JOIN chats c ON c.id = me.chat_id
  WHERE (filter_user_id IS NULL OR c.user_id = filter_user_id)
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
