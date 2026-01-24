import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { generateEmbedding } from '@/lib/embedding';

// GET - Fetch messages for a chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const result = await pool.query(
      `SELECT id, role, content, created_at 
       FROM messages 
       WHERE chat_id = $1 
       ORDER BY created_at ASC`,
      [chatId]
    );

    return NextResponse.json({ messages: result.rows });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Save message and generate embedding
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const { role, content } = await req.json();

    // Save message
    const messageResult = await pool.query(
      `INSERT INTO messages (chat_id, role, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, chat_id, role, content, created_at`,
      [chatId, role, content]
    );

    const message = messageResult.rows[0];

    // Update chat's updated_at timestamp
    await pool.query(
      `UPDATE chats SET updated_at = NOW() WHERE id = $1`,
      [chatId]
    );

    // Generate and save embedding for assistant messages (async, don't block response)
    if (role === 'assistant') {
      // Fire and forget - don't await to avoid blocking the response
      generateEmbedding(content)
        .then(async (embedding) => {
          // PostgreSQL vector type expects array format: [1,2,3] not stringified JSON
          await pool.query(
            `INSERT INTO message_embeddings (message_id, chat_id, embedding) 
             VALUES ($1, $2, $3::vector)`,
            [message.id, chatId, `[${embedding.join(',')}]`]
          );
        })
        .catch((embeddingError) => {
          console.error('Failed to save embedding:', embeddingError);
          // Don't fail the request if embedding fails
        });
    }

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Error saving message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}