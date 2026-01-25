import { NextRequest, NextResponse } from "next/server";
import { pool } from '@/lib/db';
import { auth, currentUser } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  try {
    
    const user = await currentUser()
    const currUserId = user?.id
    const currUserEmail = user?.emailAddresses[0].emailAddress
    await pool.query(
      `INSERT INTO users (id, email) 
        VALUES ($1, $2) 
        ON CONFLICT (id) DO NOTHING`,
      [currUserId, currUserEmail] // Email can be added later if needed
    );
    return NextResponse.json({ message: "user verified" });
    /* const { techStack, title } = await req.json();
 
     // Ensure user exists in database
     await pool.query(
       `INSERT INTO users (id, email) 
        VALUES ($1, $2) 
        ON CONFLICT (id) DO NOTHING`,
       [userId, null] // Email can be added later if needed
     );*/

  } catch (error: any) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}