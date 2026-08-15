import { google } from '@ai-sdk/google';
import { convertToModelMessages, streamText, type UIMessage, embed } from 'ai';
import { getOrFetchCve } from '@/lib/advisories/cache';

const CVE_ID_PATTERN = /CVE-\d{4}-\d{4,7}/gi;
const MAX_CVES_PER_TURN = 5;

function extractCveIds(messages: UIMessage[]): string[] {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMessage || !('parts' in lastUserMessage)) return [];

  const text = lastUserMessage.parts
    .filter((p: any) => p.type === 'text')
    .map((p: any) => p.text || '')
    .join(' ');

  const matches = text.match(CVE_ID_PATTERN) ?? [];
  const unique = [...new Set(matches.map((id) => id.toUpperCase()))];
  return unique.slice(0, MAX_CVES_PER_TURN);
}

async function buildAdvisoryContext(messages: UIMessage[]): Promise<string> {
  const cveIds = extractCveIds(messages);
  if (cveIds.length === 0) return '';

  const results = await Promise.all(
    cveIds.map(async (id) => ({ id, data: await getOrFetchCve(id).catch(() => null) }))
  );

  const lines = results.map(({ id, data }) => {
    if (!data) return `- ${id}: NO VERIFIED DATA FOUND. Tell the user you have no confirmed advisory for this ID rather than describing it from general knowledge.`;
    const summary = data.summary || data.details || data.descriptions?.[0]?.value || 'No summary available.';
    return `- ${id}: ${summary}`;
  });

  return `\n\nVerified advisory data (source: OSV.dev / NVD). Only assert facts present here for these IDs, and always cite the ID inline when you use it:\n${lines.join('\n')}`;
}

export async function generateChatResponse(messages: UIMessage[], techStack?: string) {
  // Build system prompt for web auditor
  let systemPrompt = 'You are a web security auditor and vulnerability analyst. Your role is to analyze vulnerability code or text provided by users and help them understand security risks.';

  if (techStack && techStack.trim()) {
    systemPrompt += ` The user is working with the following tech stack: ${techStack}. When analyzing vulnerabilities, consider how they specifically affect this tech stack. For example, if the tech stack includes nginx, explain how vulnerabilities like XSS, SQL injection, or other security issues might impact nginx configuration files, server blocks, or related components. Identify which specific files, configurations, or components in this tech stack could be affected by the reported vulnerability.`;
  } else {
    systemPrompt += ' When analyzing vulnerabilities, identify which files, configurations, or components could be affected. Consider common web technologies and their specific security implications.';
  }

  systemPrompt += ' Provide detailed explanations of vulnerabilities, their potential impact, affected files or components, and remediation steps. Be specific about file paths, configuration locations, and code patterns that could be vulnerable.';

  systemPrompt += await buildAdvisoryContext(messages);

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
