import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';

// GET - Fetch a single chat by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const user = await currentUser()
        const { chatId } = await params;

        const currUserId = user?.id

        if (!currUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await pool.query(
            `SELECT id, title, tech_stack, created_at, updated_at 
       FROM chats 
       WHERE id = $1 AND user_id = $2`,
            [chatId, currUserId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json({ chat: result.rows[0] });
    } catch (error: any) {
        console.error('Error fetching chat:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete a chat
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const {id} = await params;
         const user = await currentUser()
         const currUserId = user?.id

        if (!currUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the chat belongs to the user before deleting
        const chatCheck = await pool.query(
            `SELECT id FROM chats WHERE id = $1 AND user_id = $2`,
            [id, currUserId]
        );

        console.log(chatCheck)

        if (chatCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        // Delete the chat (cascade will delete messages and embeddings)
        await pool.query(
            `DELETE FROM chats WHERE id = $1 AND user_id = $2`,
            [id, currUserId]
        );

        return NextResponse.json({ success: true, message: 'Chat deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting chat:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

