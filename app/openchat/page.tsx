"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TECH_STACK_OPTIONS = [
  { id: "nextjs", label: "Next.js" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue.js" },
  { id: "angular", label: "Angular" },
  { id: "svelte", label: "Svelte" },
  { id: "nodejs", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "tailwind", label: "Tailwind CSS" },
  { id: "express", label: "Express.js" },
  { id: "mongodb", label: "MongoDB" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "redis", label: "Redis" },
  { id: "docker", label: "Docker" },
  { id: "aws", label: "AWS" },
];

function OpenChat() {
  const currentUserDetails = useUser();
  const router = useRouter();
  //console.log(currentUserDetails)
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const toggleTech = (techId: string) => {
    setSelectedTech((prev) =>
      prev.includes(techId)
        ? prev.filter((id) => id !== techId)
        : [...prev, techId],
    );
  };
  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTech.length === 0 && !customTech.trim()) {
      return;
    }

    if (!currentUserDetails.isSignedIn) {
      return;
    }

    setIsCreating(true);

    // Combine selected tech and custom tech
    const techStack = [
      ...selectedTech.map((id) => {
        const option = TECH_STACK_OPTIONS.find((opt) => opt.id === id);
        return option?.label || id;
      }),
      ...(customTech.trim() ? [customTech.trim()] : []),
    ].join(", ");

    try {
      // Create chat in database
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserDetails.user.id,
          techStack,
          title: `Security Audit - ${techStack}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to chat with tech stack and chat ID
        const params = new URLSearchParams({
          techStack,
          chatId: data.chat.id,
        });
        router.push(`/chat?${params.toString()}`);
      } else {
        console.error("Failed to create chat");
        // Still navigate even if chat creation fails
        //  const params = new URLSearchParams({ techStack });
        // router.push(`/openchat?${params.toString()}`);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      // Still navigate even if chat creation fails
      // const params = new URLSearchParams({ techStack });
      // router.push(`/openchat?${params.toString()}`);
    } finally {
      setIsCreating(false);
    }
  };
  if (!currentUserDetails.isLoaded) return <>Loading</>;
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

        <div className="mb-12">
          <h1 className="text-4xl font-normal tracking-tight text-gray-900 mb-3">
            What to understand today
          </h1>
          <p className="text-base text-gray-600">
            Select your tech stack to analyze vulnerabilities and identify which
            files or components could be affected
          </p>
        </div>

        <form onSubmit={handleCreateChat} className="space-y-8">
          <div>
            <label className="mb-4 block text-sm font-medium text-gray-900">
              Select Tech Stack
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {TECH_STACK_OPTIONS.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => toggleTech(tech.id)}
                  className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium transition-all ${
                    selectedTech.includes(tech.id)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <span>{tech.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="customTech"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Additional Technologies (comma-separated)
            </label>
            <input
              id="customTech"
              type="text"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              placeholder="e.g., GraphQL, Prisma, Vercel"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {(selectedTech.length > 0 || customTech.trim()) && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-medium text-gray-900">
                Selected Tech Stack:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTech.map((id) => {
                  const option = TECH_STACK_OPTIONS.find(
                    (opt) => opt.id === id,
                  );
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {option?.label}
                    </span>
                  );
                })}
                {customTech
                  .trim()
                  .split(",")
                  .map((tech, idx) => (
                    <span
                      key={`custom-${idx}`}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {tech.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              (selectedTech.length === 0 && !customTech.trim()) || isCreating
            }
            className="bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Creating Chat..." : "Start Chat"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default OpenChat;
