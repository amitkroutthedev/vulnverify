import { type UIMessage } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';

// Helper function to extract text content from UIMessage
function extractMessageContent(message: UIMessage): string {
  // UIMessage uses 'parts' property, not 'content'
  if ('parts' in message && Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text || '')
      .join('');
  }
  
  return '';
}

export async function POST(req: Request) {
  try {
    const { messages, techStack, chatId }: { 
      messages: UIMessage[]; 
      techStack?: string;
      chatId?: string;
    } = await req.json();

    const { userId } = await auth();

    // Save user message to database if chatId is provided
    if (chatId && userId) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === 'user') {
        const content = extractMessageContent(lastUserMessage);
        
        if (content.trim()) {
          // Save user message with proper error handling
          pool.query(
            `INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)`,
            [chatId, 'user', content]
          ).then(() => {
            console.log(`[Chat API] Saved user message to chat ${chatId}`);
          }).catch((error) => {
            console.error(`[Chat API] Failed to save user message:`, error);
          });

          // Update chat timestamp
          pool.query(
            `UPDATE chats SET updated_at = NOW() WHERE id = $1`,
            [chatId]
          ).catch((error) => {
            console.error(`[Chat API] Failed to update chat timestamp:`, error);
          });
        } else {
          console.warn(`[Chat API] User message has no content, skipping save`);
        }
      }
    } else {
      if (!chatId) {
        console.warn(`[Chat API] No chatId provided, skipping message save`);
      }
      if (!userId) {
        console.warn(`[Chat API] No userId found, skipping message save`);
      }
    }

    const { generateChatResponse } = await import('@/lib/embedding');
    return generateChatResponse(messages, techStack);
  } catch (error: any) {
    console.error('[Chat API] Error in POST handler:', error);
    throw error;
  }
}

