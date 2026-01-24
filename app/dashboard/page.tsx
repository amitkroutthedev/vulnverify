"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Chat {
  id: string;
  title: string;
  tech_stack: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalChats: number;
  totalMessages: number;
  recentChats: Chat[];
}

function Dashboard() {
  const currentUserDetails = useUser();
  const [loading,setLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalChats: 0,
    totalMessages: 0,
    recentChats: [],
  });

  const currentUserName = currentUserDetails.user?.firstName;
  const currentUserId = currentUserDetails.user?.id

 // console.log(currentUserDetails);
 // console.log(currentUserName);

  useEffect(()=>{
    if(currentUserDetails.isLoaded && currentUserDetails.isSignedIn){
      fetchDashboardData()
    }
  },[currentUserDetails.isLoaded, currentUserDetails.isSignedIn])

  
   const fetchDashboardData = async () => {
    if (currentUserName === undefined) return;

    try {
      setLoading(true);
      const [chatsResponse, statsResponse] = await Promise.all([
        fetch(`/api/chats?userId=${currentUserId}`),
        fetch(`/api/dashboard?userId=${currentUserId}`),
      ]);
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json();
        const chats = chatsData.chats || [];
        setStats((prev) => ({
          ...prev,
          totalChats: chats.length,
          recentChats: chats.slice(0, 5),
        }));
      }
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats((prev) => ({
          ...prev,
          totalMessages: statsData.totalMessages || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUserDetails.isLoaded) return <>Loading</>;
 return (
  <div className="min-h-screen bg-white">
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-base font-medium text-gray-900">VulnVerify</span>
      </div>
      <UserButton />
    </header>
    
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <div className="mb-16">
        <h1 className="text-4xl font-normal tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Welcome back, <span className="font-medium text-gray-900">{currentUserName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Chats
              </p>
              <p className="mt-3 text-3xl font-normal text-gray-900">
                {loading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-100"></span>
                ) : (
                  stats.totalChats
                )}
              </p>
            </div>
            <div className="p-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Messages
              </p>
              <p className="mt-3 text-3xl font-normal text-gray-900">
                {loading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-100"></span>
                ) : (
                  stats.totalMessages
                )}
              </p>
            </div>
            <div className="p-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Active Analysis
              </p>
              <p className="mt-3 text-3xl font-normal text-gray-900">
                {loading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-100"></span>
                ) : (
                  stats.recentChats.length
                )}
              </p>
            </div>
            <div className="p-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/openchat"
          className="bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <span>New security audit</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
        <Link
          href="/history"
          className="text-blue-600 px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          View chat history
        </Link>
      </div>
    </section>
  </div>
);
}

export default Dashboard;
