"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import AnimatedMarkdown, { type NetworkInfo } from "../../components/AnimatedMarkdown";
import { useRouter } from "next/navigation";

interface DbMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

// Network speed detection - only runs on client
function detectNetworkSpeed(): NetworkInfo {
  if (typeof window === 'undefined') {
    return { speed: 'medium' };
  }
  
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (connection) {
    const { effectiveType, downlink, rtt } = connection;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || (downlink && downlink < 0.5)) {
      return { speed: 'slow', effectiveType, downlink, rtt };
    } else if (effectiveType === '3g' || (downlink && downlink < 2)) {
      return { speed: 'medium', effectiveType, downlink, rtt };
    } else {
      return { speed: 'fast', effectiveType, downlink, rtt };
    }
  }
  
  return { speed: 'medium' };
}

function OpenChatContent() {
  const { user, isLoaded } = useUser();
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [loadedTechStack, setLoadedTechStack] = useState<string>("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const techStack = searchParams.get("techStack") || loadedTechStack || "";
  const urlChatId = searchParams.get("chatId");
  const router = useRouter();
  
  // Network speed detection
  const [networkSpeed, setNetworkSpeed] = useState<NetworkInfo>(() => detectNetworkSpeed());
  
  // Redirect to /openchat if no techStack and no chatId
  useEffect(() => {
    if (isLoaded && !searchParams.get("techStack") && !urlChatId) {
      router.push('/openchat');
    }
  }, [isLoaded, searchParams, urlChatId, router]);
  
  // Monitor network speed changes
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const updateNetworkSpeed = () => {
        setNetworkSpeed(detectNetworkSpeed());
      };
      
      connection.addEventListener('change', updateNetworkSpeed);
      return () => connection.removeEventListener('change', updateNetworkSpeed);
    }
  }, []);

  // Initialize chat ID from URL or create new one
  useEffect(() => {
    // Set chatId from URL immediately if available
    if (urlChatId && urlChatId !== chatId) {
      setChatId(urlChatId);
      return;
    }
    
    // Create new chat if tech stack is provided and no chatId exists
    if (isLoaded && user && techStack && !chatId && !urlChatId) {
      // Create new chat if tech stack is provided
      fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          techStack,
          title: `Security Audit - ${techStack}`,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.chat) {
            setChatId(data.chat.id);
            // Update URL with chatId for future reference
            const params = new URLSearchParams(window.location.search);
            params.set('chatId', data.chat.id);
            window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
          }
        })
        .catch((error) => {
          console.error('Failed to create chat:', error);
        });
    }
  }, [isLoaded, user, techStack, chatId, urlChatId]);

  // Create transport with current chatId - useMemo ensures it updates when chatId changes
  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/chat",
      body: {
        techStack: techStack || undefined,
        chatId: chatId || undefined,
      },
    });
  }, [techStack, chatId]);

  const { messages, sendMessage, status, setMessages } = useChat({
    // Use chatId as the key to force hook re-initialization when chatId changes
    id: chatId || 'new-chat',
    transport,
    onFinish: async (message) => {
      // The message object from onFinish wraps the actual message in a 'message' property
      const assistantMessage = message.message || message;    //oldformat || new format
      const role = assistantMessage.role;
      
      if (chatId && role === 'assistant') {
        const content = getMessageText(assistantMessage);
        
        if (content.trim()) {
          try {
            const response = await fetch(`/api/chats/${chatId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                role: 'assistant',
                content: content,
              }),
            });
            
            if (!response.ok) {
              const error = await response.json();
              console.error('Failed to save assistant message:', error);
            }
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }
      }
    },
  });

  // Fetch chat details and messages when chatId is available
  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId || !isLoaded || !user || messagesLoaded || loadingMessages) return;
      
      try {
        setLoadingMessages(true);
        
        // Fetch chat details to get techStack if not in URL
        if (!searchParams.get("techStack")) {
          const chatResponse = await fetch(`/api/chats/${chatId}`);
          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            if (chatData.chat?.tech_stack) {
              setLoadedTechStack(chatData.chat.tech_stack);
            }
          }
        }
        
        // Fetch messages
        const messagesResponse = await fetch(`/api/chats/${chatId}/messages`);
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          const dbMessages: DbMessage[] = data.messages || [];
          
          // Convert database messages to UIMessage format
          const uiMessages: UIMessage[] = dbMessages.map((msg) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            parts: [{ type: 'text', text: msg.content }],
          }));
          
          // Set messages in useChat hook
          if (uiMessages.length > 0 && setMessages) {
            setMessages(uiMessages);
          }
          setMessagesLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    if (chatId) {
      fetchChatData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, isLoaded, user, messagesLoaded]);

  const isLoading = status === "streaming" || status === "submitted";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Ensure chatId is set before sending (if techStack is provided)
    if (techStack && !chatId && !urlChatId) {
      console.warn('ChatId not set yet, waiting for chat creation...');
      return;
    }

    sendMessage({
      parts: [{ type: "text", text: input.trim() }],
    });
    setInput("");
  };

  // Helper function to extract text content from message parts
  const getMessageText = (message: any): string => {
    return message.parts
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("");
  };

  // Helper function to get message role
  const getMessageRole = (message: any): "user" | "assistant" => {
    return message.role === "user" ? "user" : "assistant";
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-base font-medium text-gray-900">VulnVerify</span>
            </Link>
            {techStack && (
              <div className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
                <span className="text-gray-400">•</span>
                <span className="truncate max-w-[200px]">{techStack}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            {/* Network speed indicator */}
            <div className="hidden items-center gap-1.5 text-xs text-gray-500 sm:flex">
              <div className={`h-2 w-2 rounded-full ${
                networkSpeed.speed === 'fast' ? 'bg-green-500' :
                networkSpeed.speed === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="capitalize">{networkSpeed.speed}</span>
            </div>
            <UserButton />
          </div>
        </div>
      </header>
  
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8 bg-gray-50">
        <div className="mx-auto max-w-4xl space-y-6">
          {loadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600">Loading chat history...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-normal text-gray-900">
                  {techStack ? "Security Auditor Ready" : "Start Security Analysis"}
                </h2>
                <p className="text-gray-600">
                  {techStack
                    ? `Ready to analyze vulnerabilities for ${techStack}. Paste your code or describe the security issue.`
                    : "Paste vulnerability code or describe a security issue to analyze"}
                </p>
                {techStack && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
                    <span>Tech Stack:</span>
                    <span className="font-medium">{techStack}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const role = getMessageRole(message);
              const content = getMessageText(message);
              const isStreamingMessage = isLoading && role === 'assistant' && message === messages[messages.length - 1];
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        className="h-4 w-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] overflow-hidden rounded-lg px-4 py-3 ${
                      role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    {role === "assistant" ? (
                      <AnimatedMarkdown 
                        content={content} 
                        isStreaming={isStreamingMessage}
                        networkSpeed={networkSpeed}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {content}
                      </p>
                    )}
                    <p
                      className={`mt-2 text-xs ${
                        role === "user"
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {isLoading && messages.length > 0 && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-4 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="rounded-lg bg-white px-4 py-3 border border-gray-200">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
  
      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSend} className="mx-auto max-w-4xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste vulnerability code or describe security issue..."
              disabled={isLoading}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading fallback component
function ChatLoadingFallback() {
  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    </div>
  );
}

export default function OpenChat() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <OpenChatContent />
    </Suspense>
  );
}