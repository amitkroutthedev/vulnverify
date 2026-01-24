"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Chat {
  id: string;
  title: string;
  tech_stack: string | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

function History() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchChats();
    }
  }, [isLoaded, isSignedIn]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const fetchChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/chats?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      const data = await response.json();
      setChats(data.chats || []);

      // If there's a chatId in URL, select it
      const chatIdParam = searchParams.get("chatId");
      if (chatIdParam) {
        const chat = data.chats?.find((c: Chat) => c.id === chatIdParam);
        if (chat) {
          setSelectedChat(chat);
          //    fetchMessages(chat.id);
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (chat: Chat) => {
    const params = new URLSearchParams();
    if (chat.tech_stack) {
      params.set("techStack", chat.tech_stack);
    }
    params.set("chatId", chat.id);
    router.push(`/chat?${params.toString()}`);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chat selection

    if (
      !confirm(
        "Are you sure you want to delete this chat? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete chat");
      }

      // Remove the chat from the list
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      // If the deleted chat was selected, clear the selection
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat: " + error.message);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-[#212f45]">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <p className="text-lg text-[#212f45]">
            Please sign in to view your chat history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="text-base font-medium text-gray-900">
            VulnVerify
          </span>
        </div>
        <UserButton />
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-normal tracking-tight text-gray-900">
            History
          </h1>
        </div>

        <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
          {chats &&
            chats.length !== 0 &&
            chats.map((data, index) => {
              return (
                <div
                  key={data.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    index !== chats.length - 1 ? "border-b border-gray-200" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-medium text-gray-900 truncate">
                      {data.title}
                    </div>
                    {data.tech_stack && (
                      <div className="mt-1 text-sm text-gray-600 truncate">
                        {data.tech_stack}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      {formatRelativeTime(data.updated_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteChat(data.id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete chat"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenChat(data)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Continue Chat
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {chats && chats.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No chat history yet</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default History;
