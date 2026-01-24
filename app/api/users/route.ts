import { NextRequest, NextResponse } from "next/server";
import { pool } from '@/lib/db';
import {auth,currentUser} from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  try {
    console.log("working")
    const user = await currentUser()
    const currUserId = user?.id
   // console.log(user?.id)
   // console.log(user)
    await pool.query(
        `INSERT INTO users (id, email) 
        VALUES ($1, $2) 
        ON CONFLICT (id) DO NOTHING`,
        [currUserId, null] // Email can be added later if needed
    );
    return NextResponse.json({ message:"worknig" });
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