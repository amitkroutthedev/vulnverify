import { pool } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch user's chats
export async function GET(req: NextRequest) {
    try {
        const user = await currentUser()
        const currUserId = user?.id

        if (!currUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await pool.query(
            `SELECT id, title, tech_stack, created_at, updated_at 
       FROM chats 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
            [currUserId]
        );

        return NextResponse.json({ chats: result.rows });
    } catch (error: any) {
        console.error('Error fetching chats:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new chat

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser()
        const currUserId = user?.id
        if (!currUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { techStack, title } = await req.json();

        // Ensure user exists in database
        await pool.query(
            `INSERT INTO users (id, email) 
       VALUES ($1, $2) 
       ON CONFLICT (id) DO NOTHING`,
            [currUserId, null] // Email can be added later if needed
        );

        const result = await pool.query(
            `INSERT INTO chats (user_id, tech_stack, title) 
       VALUES ($1, $2, $3) 
       RETURNING id, user_id, tech_stack, title, created_at, updated_at`,
            [currUserId, techStack || null, title || 'New Chat']
        );

        return NextResponse.json({ chat: result.rows[0] });
    } catch (error: any) {
        console.error('Error creating chat:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}