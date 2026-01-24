import { google } from '@ai-sdk/google';
import { convertToModelMessages, streamText, type UIMessage, embed } from 'ai';

export async function generateChatResponse(messages: UIMessage[], techStack?: string) {
  // Build system prompt for web auditor
  let systemPrompt = 'You are a web security auditor and vulnerability analyst. Your role is to analyze vulnerability code or text provided by users and help them understand security risks.';
  
  if (techStack && techStack.trim()) {
    systemPrompt += ` The user is working with the following tech stack: ${techStack}. When analyzing vulnerabilities, consider how they specifically affect this tech stack. For example, if the tech stack includes nginx, explain how vulnerabilities like XSS, SQL injection, or other security issues might impact nginx configuration files, server blocks, or related components. Identify which specific files, configurations, or components in this tech stack could be affected by the reported vulnerability.`;
  } else {
    systemPrompt += ' When analyzing vulnerabilities, identify which files, configurations, or components could be affected. Consider common web technologies and their specific security implications.';
  }
  
  systemPrompt += ' Provide detailed explanations of vulnerabilities, their potential impact, affected files or components, and remediation steps. Be specific about file paths, configuration locations, and code patterns that could be vulnerable.';

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.textEmbedding('text-embedding-004'),
    value: text,
  });
  return embedding;
}
