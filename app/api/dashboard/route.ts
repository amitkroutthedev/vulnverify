import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';

// GET - Fetch dashboard statistics
export async function GET(req: NextRequest) {
  try {
     const user = await currentUser()
    const currUserId = user?.id
    
    if (!currUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total messages count
    const messagesResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM messages m
       JOIN chats c ON c.id = m.chat_id
       WHERE c.user_id = $1`,
      [currUserId]
    );

    const totalMessages = parseInt(messagesResult.rows[0]?.count || '0');

    return NextResponse.json({ 
      totalMessages,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

